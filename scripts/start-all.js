import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const children = [];

function startProcess(name, script) {
  const child = spawn(npmCmd, ['run', script], {
    stdio: 'inherit',
    shell: isWindows,
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start:`, error.message);
    shutdown(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code || 1);
    }
  });

  children.push(child);
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting backend and frontend...');
startProcess('backend', 'backend');
startProcess('frontend', 'dev');
