import { spawn } from 'child_process';
import { Mutex, MutexInterface } from 'async-mutex';

const delay = async (ms: number) => {
  const result = await new Promise((resolve) => setTimeout(resolve, ms));
  return result;
};

const mutex = new Mutex();
let release: MutexInterface.Releaser;

const availPort: number[] = [];
for (let idx = 1; idx < 5000; idx += 1) {
  if (idx !== 80) {
    availPort.push(idx);
  }
}

const processInfo = {};

export const create = async (command: string, port: number) => {
  release = await mutex.acquire();
  release();
  return new Promise<number>((resolve, reject) => {
    const ttydCommand = `-p ${port} ${command}`;

    processInfo[String(port)] = spawn('ttyd', ttydCommand.split(' '), {
      detached: true,
    });
    processInfo[String(port)].on('error', (error: string) => {
      reject(error);
    });
    processInfo[String(port)].unref();
    delay(3000)
      .then(() => {
        resolve(port);
      });
  });
};

export const remove = async (port: number) => {
  release = await mutex.acquire();
  availPort.push(port);
  release();
  if (processInfo[String(port)]) {
    processInfo[String(port)].kill();
    delete processInfo[String(port)];
  }
};
