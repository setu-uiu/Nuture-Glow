/**
 * WebRTC Signaling Server
 * 
 * Simple WebSocket-based signaling for peer-to-peer video calls.
 * Handles: room join/leave, SDP offer/answer relay, ICE candidate relay.
 */
import { WebSocketServer } from 'ws';
import { query } from './db.js';
import { v4 as uuidv4 } from 'uuid';

// Map of roomId -> Set<ws>
const rooms = new Map();
// Map of ws -> { roomId, role, userId }
const clients = new Map();

/**
 * Attach the signaling WebSocket server to an existing HTTP server.
 * @param {import('http').Server} server
 */
export function attachSignaling(server) {
  const wss = new WebSocketServer({ server, path: '/ws/signaling' });

  wss.on('connection', (ws, req) => {
    console.log('[Signaling] New connection');

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      switch (msg.type) {
        case 'join':
          handleJoin(ws, msg);
          break;
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          relayToPeer(ws, msg);
          break;
        case 'call-end':
          handleCallEnd(ws, msg);
          break;
        default:
          break;
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws);
    });

    ws.on('error', () => {
      handleDisconnect(ws);
    });
  });

  console.log('[Signaling] WebSocket server attached at /ws/signaling');
  return wss;
}

function handleJoin(ws, msg) {
  const { roomId, role, userId } = msg; // role = 'doctor' | 'patient'
  if (!roomId) return;

  // Leave any existing room
  handleDisconnect(ws, true);

  // Join room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  const room = rooms.get(roomId);

  // Max 2 peers per room
  if (room.size >= 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
    return;
  }

  room.add(ws);
  clients.set(ws, { roomId, role: role || 'unknown', userId: userId || null });

  // Notify the joiner how many peers are in the room
  ws.send(JSON.stringify({ type: 'joined', roomId, peerCount: room.size }));

  // If second person joins, tell first peer to initiate the offer
  if (room.size === 2) {
    for (const peer of room) {
      if (peer !== ws && peer.readyState === 1) {
        peer.send(JSON.stringify({ type: 'peer-joined', role: role || 'unknown' }));
      }
    }
  }

  // Record session start when both parties are in
  if (room.size === 2) {
    recordSessionStart(roomId, room).catch(err => {
      console.error('[Signaling] Failed to record session start:', err.message);
    });
  }
}

function relayToPeer(ws, msg) {
  const client = clients.get(ws);
  if (!client) return;

  const room = rooms.get(client.roomId);
  if (!room) return;

  // Relay to the other peer in the room
  for (const peer of room) {
    if (peer !== ws && peer.readyState === 1) {
      peer.send(JSON.stringify(msg));
    }
  }
}

function handleCallEnd(ws, msg) {
  const client = clients.get(ws);
  if (!client) return;

  const room = rooms.get(client.roomId);
  if (!room) return;

  // Notify peer
  for (const peer of room) {
    if (peer !== ws && peer.readyState === 1) {
      peer.send(JSON.stringify({ type: 'call-ended' }));
    }
  }

  // Record session end
  recordSessionEnd(client.roomId).catch(err => {
    console.error('[Signaling] Failed to record session end:', err.message);
  });

  // Clean up room
  cleanupRoom(client.roomId);
}

function handleDisconnect(ws, silent = false) {
  const client = clients.get(ws);
  if (!client) return;

  const room = rooms.get(client.roomId);
  if (room) {
    room.delete(ws);

    if (!silent) {
      // Notify remaining peer
      for (const peer of room) {
        if (peer.readyState === 1) {
          peer.send(JSON.stringify({ type: 'peer-left' }));
        }
      }

      // Record session end if room is now empty
      if (room.size === 0) {
        recordSessionEnd(client.roomId).catch(() => {});
        rooms.delete(client.roomId);
      }
    }
  }

  clients.delete(ws);
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    for (const peer of room) {
      clients.delete(peer);
    }
    rooms.delete(roomId);
  }
}

// ---- Session Metadata Recording ----

async function recordSessionStart(roomId, room) {
  // roomId is the appointment ID
  const participants = [];
  for (const peer of room) {
    const c = clients.get(peer);
    if (c) participants.push(c);
  }

  const doctor = participants.find(p => p.role === 'doctor');
  const patient = participants.find(p => p.role !== 'doctor');

  const sessionId = uuidv4();
  await query(
    `INSERT INTO telemedicine_sessions (id, appointment_id, doctor_id, patient_id, started_at, status, call_type)
     VALUES (?, ?, ?, ?, NOW(), 'active', 'video')`,
    [sessionId, roomId, doctor?.userId || '', patient?.userId || '']
  );

  // Also update appointment status
  try {
    const rows = await query('SELECT id, data FROM app_entities WHERE id = ? AND type = ? LIMIT 1', [roomId, 'appointment']);
    if (rows.length) {
      const data = JSON.parse(rows[0].data);
      data.status = 'In Progress';
      data.meetingData = {
        ...(data.meetingData || {}),
        sessionId,
        status: 'active',
        startedAt: new Date().toISOString()
      };
      await query('UPDATE app_entities SET data = ? WHERE id = ?', [JSON.stringify(data), roomId]);
    }
  } catch (err) {
    console.error('[Signaling] Failed to update appointment:', err.message);
  }
}

async function recordSessionEnd(roomId) {
  // End the active session for this appointment
  try {
    const sessions = await query(
      `SELECT id, started_at FROM telemedicine_sessions WHERE appointment_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [roomId]
    );
    if (sessions.length) {
      const session = sessions[0];
      const startTime = new Date(session.started_at).getTime();
      const duration = Math.round((Date.now() - startTime) / 1000);
      await query(
        `UPDATE telemedicine_sessions SET ended_at = NOW(), duration_seconds = ?, status = 'ended' WHERE id = ?`,
        [duration, session.id]
      );
    }

    // Update appointment status
    const rows = await query('SELECT id, data FROM app_entities WHERE id = ? AND type = ? LIMIT 1', [roomId, 'appointment']);
    if (rows.length) {
      const data = JSON.parse(rows[0].data);
      data.status = 'Completed';
      if (data.meetingData) {
        data.meetingData.status = 'ended';
        data.meetingData.endedAt = new Date().toISOString();
      }
      await query('UPDATE app_entities SET data = ? WHERE id = ?', [JSON.stringify(data), roomId]);
    }
  } catch (err) {
    console.error('[Signaling] Failed to record session end:', err.message);
  }
}
