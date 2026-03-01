import { execSync } from 'node:child_process';
import process from 'node:process';

const cliPort = Number(process.argv[2]);
const envPort = Number(process.env.PORT || 4000);
const port = Number.isInteger(cliPort) && cliPort > 0 ? cliPort : envPort;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`[predev] Invalid port: ${port}`);
  process.exit(1);
}

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
}

function getListeningPidsWindows(targetPort) {
  const output = run('netstat -ano -p tcp');
  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) {
      continue;
    }

    const localAddress = parts[1];
    const state = parts[3];
    const pid = Number(parts[4]);

    if (state !== 'LISTENING') {
      continue;
    }

    if (localAddress.endsWith(`:${targetPort}`) && Number.isInteger(pid) && pid > 0 && pid !== process.pid) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function getNodeProcessesWindows() {
  const raw = run(
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'node.exe\'\\" | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress"'
  ).trim();

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows
      .map((row) => ({
        pid: Number(row.ProcessId),
        parentPid: Number(row.ParentProcessId),
        commandLine: String(row.CommandLine || '')
      }))
      .filter((row) => Number.isInteger(row.pid) && row.pid > 0);
  } catch {
    return [];
  }
}

function getProjectNodemonPidsWindows(projectDir) {
  const normalizedProjectDir = projectDir.replace(/\//g, '\\').toLowerCase();
  const pids = new Set();

  for (const proc of getNodeProcessesWindows()) {
    const cmd = proc.commandLine.replace(/\//g, '\\').toLowerCase();
    if (!cmd.includes('nodemon')) {
      continue;
    }
    if (!cmd.includes(normalizedProjectDir)) {
      continue;
    }
    if (proc.pid !== process.pid) {
      pids.add(proc.pid);
    }
  }

  return [...pids];
}

function getListeningPidsUnix(targetPort) {
  const pids = new Set();

  const lsofOutput = run(`lsof -ti tcp:${targetPort} -sTCP:LISTEN`);
  for (const line of lsofOutput.split(/\r?\n/)) {
    const pid = Number(line.trim());
    if (Number.isInteger(pid) && pid > 0 && pid !== process.pid) {
      pids.add(pid);
    }
  }

  if (pids.size > 0) {
    return [...pids];
  }

  const ssOutput = run(`ss -lptn "sport = :${targetPort}"`);
  for (const line of ssOutput.split(/\r?\n/)) {
    const matches = line.match(/pid=(\d+)/g) || [];
    for (const match of matches) {
      const pid = Number(match.replace('pid=', ''));
      if (Number.isInteger(pid) && pid > 0 && pid !== process.pid) {
        pids.add(pid);
      }
    }
  }

  return [...pids];
}

function killPidWindows(pid) {
  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: ['ignore', 'pipe', 'pipe'] });
    return true;
  } catch {
    return false;
  }
}

function killPidUnix(pid) {
  try {
    process.kill(pid, 'SIGTERM');
    return true;
  } catch {
    return false;
  }
}

const pids =
  process.platform === 'win32'
    ? [
        ...new Set([
          ...getListeningPidsWindows(port),
          ...getProjectNodemonPidsWindows(process.cwd())
        ])
      ]
    : getListeningPidsUnix(port);

if (pids.length === 0) {
  console.log(`[predev] Port ${port} is free and no stale nodemon process was found.`);
  process.exit(0);
}

console.log(`[predev] Cleaning stale backend process(es): ${pids.join(', ')}`);

const failed = [];
for (const pid of pids) {
  const ok = process.platform === 'win32' ? killPidWindows(pid) : killPidUnix(pid);
  if (!ok) {
    failed.push(pid);
  }
}

if (failed.length > 0) {
  console.error(`[predev] Failed to stop process(es): ${failed.join(', ')}`);
  process.exit(1);
}

console.log(`[predev] Port ${port} cleared.`);
