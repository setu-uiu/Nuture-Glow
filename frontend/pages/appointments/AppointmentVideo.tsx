import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft, AlertCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentService } from '../../services/appointmentService';
import type { Appointment } from '../../types';

type CallState = 'loading' | 'ready' | 'connecting' | 'connected' | 'ended' | 'error' | 'no-meeting';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

const AppointmentVideo: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [callState, setCallState] = useState<CallState>('loading');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const userRole = user?.role === 'doctor' ? 'doctor' : 'patient';

  const getWsUrl = useCallback(() => {
    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiBase = import.meta.env.VITE_API_URL || `${loc.protocol}//${loc.hostname}:3000`;
    try {
      const url = new URL(apiBase);
      return `${protocol}//${url.host}/ws/signaling`;
    } catch {
      return `${protocol}//${loc.hostname}:3000/ws/signaling`;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsVideoOff(true);
        return stream;
      } catch {
        throw new Error('Cannot access camera or microphone. Please allow permissions.');
      }
    }
  }, []);

  const createPeerConnection = useCallback((ws: WebSocket) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startTimer();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setCallState('ended');
        stopTimer();
      }
    };

    return pc;
  }, [startTimer, stopTimer]);

  const cleanup = useCallback((sendEndMsg = true) => {
    stopTimer();
    if (sendEndMsg && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call-end' }));
    }
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
  }, [stopTimer]);

  const connectToRoom = useCallback(async () => {
    if (!id || !user) return;
    setCallState('connecting');
    setError(null);

    try {
      const stream = await getLocalStream();
      if (!stream) return;

      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', roomId: id, role: userRole, userId: user.id }));
      };

      ws.onmessage = async (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }

        switch (msg.type) {
          case 'joined': {
            createPeerConnection(ws);
            if (msg.peerCount === 1) setCallState('connecting');
            break;
          }
          case 'peer-joined': {
            const pc = pcRef.current;
            if (!pc) break;
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
            } catch (err) { console.error('Failed to create offer:', err); }
            break;
          }
          case 'offer': {
            let pc = pcRef.current;
            if (!pc) pc = createPeerConnection(ws);
            try {
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
            } catch (err) { console.error('Failed to handle offer:', err); }
            break;
          }
          case 'answer': {
            const pc = pcRef.current;
            if (!pc) break;
            try { await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp })); }
            catch (err) { console.error('Failed to set answer:', err); }
            break;
          }
          case 'ice-candidate': {
            const pc = pcRef.current;
            if (!pc) break;
            try { await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); }
            catch (err) { console.error('Failed to add ICE candidate:', err); }
            break;
          }
          case 'peer-left':
          case 'call-ended': {
            setCallState('ended');
            stopTimer();
            cleanup(false);
            break;
          }
          case 'error': {
            setError(msg.message || 'Connection error');
            setCallState('error');
            break;
          }
        }
      };

      ws.onerror = () => { setError('WebSocket connection failed'); setCallState('error'); };
      ws.onclose = () => { /* handled by peer-left / call-ended */ };
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setCallState('error');
    }
  }, [id, user, userRole, getLocalStream, getWsUrl, createPeerConnection, stopTimer, cleanup]);

  // Load appointment info
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    AppointmentService.getMeetingInfo(id)
      .then((res) => {
        if (!mounted) return;
        if (res?.data?.meetingData) {
          setAppointment(res.data.appointment || null);
          setCallState('ready');
        } else {
          setCallState('no-meeting');
          setAppointment(res?.data?.appointment || null);
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        if (err?.status === 403) { navigate('/appointments'); return; }
        if (err?.status === 404) { setCallState('no-meeting'); return; }
        setError(err?.message || 'Failed to load');
        setCallState('error');
      });
    return () => { mounted = false; };
  }, [id, navigate]);

  useEffect(() => { return () => cleanup(); }, [cleanup]);

  const handleCreateMeeting = async () => {
    if (!id) return;
    setIsCreating(true);
    try {
      const res = await AppointmentService.createVideoMeeting(id);
      if (res?.data?.meetingData) {
        setAppointment(res.data.appointment || null);
        setCallState('ready');
      } else { setError(res?.error || 'Failed to create session'); }
    } catch (err: any) { setError(err?.message || 'Failed to create'); }
    finally { setIsCreating(false); }
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(prev => !prev);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOff(prev => !prev);
  };

  const handleEndCall = () => { cleanup(true); setCallState('ended'); stopTimer(); };
  const handleExit = () => { cleanup(true); navigate('/appointments'); };
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!id) return <Navigate to="/appointments" replace />;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-gray-700/50">
        <button type="button" onClick={handleExit} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-center">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
            {callState === 'connected' ? 'In Call' : callState === 'connecting' ? 'Connecting...' : callState === 'ended' ? 'Call Ended' : 'Video Consultation'}
          </p>
          {callState === 'connected' && (
            <div className="flex items-center gap-1 justify-center text-xs text-gray-400 mt-0.5">
              <Clock size={12} /> <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400">{appointment?.doctorName || 'Consultation'}</div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover absolute inset-0" />

        {callState !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center space-y-4">
              {callState === 'loading' && <div className="text-gray-400">Loading...</div>}

              {callState === 'no-meeting' && (
                <div className="space-y-4 max-w-md mx-auto px-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
                    <Video size={32} className="text-gray-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-300">No Active Session</h2>
                  {userRole === 'doctor' ? (
                    <>
                      <p className="text-sm text-gray-500">Create a video session to start the consultation.</p>
                      <button type="button" onClick={handleCreateMeeting} disabled={isCreating}
                        className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50">
                        {isCreating ? 'Creating...' : 'Create Video Session'}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Waiting for your doctor to start the session...</p>
                  )}
                </div>
              )}

              {callState === 'ready' && (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-900/50 flex items-center justify-center ring-4 ring-emerald-500/30">
                    <Video size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold">Ready to Join</h2>
                  <p className="text-sm text-gray-400">
                    {appointment?.doctorName ? `Consultation with ${appointment.doctorName}` : 'Video Consultation'}
                  </p>
                  <button type="button" onClick={connectToRoom}
                    className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/40">
                    Join Call
                  </button>
                </div>
              )}

              {callState === 'connecting' && (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-900/50 flex items-center justify-center animate-pulse">
                    <Video size={32} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold">Connecting...</h2>
                  <p className="text-sm text-gray-400">Waiting for the other participant to join</p>
                </div>
              )}

              {callState === 'ended' && (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
                    <PhoneOff size={32} className="text-gray-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-300">Call Ended</h2>
                  {duration > 0 && <p className="text-sm text-gray-500">Duration: {formatDuration(duration)}</p>}
                  <button type="button" onClick={handleExit}
                    className="px-6 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all">
                    Back to Appointments
                  </button>
                </div>
              )}

              {callState === 'error' && (
                <div className="space-y-4 max-w-md mx-auto px-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-900/30 flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-red-300">Error</h2>
                  <p className="text-sm text-red-400/80">{error}</p>
                  <button type="button" onClick={handleExit}
                    className="px-6 py-3 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all">
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local video PiP */}
        <div className="absolute bottom-24 right-4 w-40 h-30 md:w-52 md:h-40 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-700 bg-gray-800">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff size={24} className="text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {(callState === 'connecting' || callState === 'connected') && (
        <div className="bg-gray-800/90 backdrop-blur border-t border-gray-700/50 py-4 px-6">
          <div className="flex items-center justify-center gap-6">
            <button type="button" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button type="button" onClick={toggleVideo} title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
              {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>
            <button type="button" onClick={handleEndCall} title="End call"
              className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-lg shadow-red-900/40">
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentVideo;
