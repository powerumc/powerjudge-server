import * as fs from "fs";
import {promisify} from "util";
import rimraf = require("rimraf");

export class NumberUtils {
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

const mkdirAsync = promisify(fs.mkdir);

export class FsUtils {
  static mkdir(path: fs.PathLike): Promise<void> {
    if (fs.existsSync(path)) return Promise.resolve();

    return mkdirAsync(path);
  }

  static rmdir(path: fs.PathLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      rimraf(path.toString(),error => {
        if (error)
          return reject(error);

        resolve();
      });
    });
  }

  static write(path: fs.PathLike, data: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(path, data, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }
}

export class StopWatch {
  private starttime: [number, number];
  private endtime: [number, number];

  start(): this {
    this.starttime = process.hrtime();
    return this;
  }

  static start() {
    return new StopWatch().start();
  }

  end(): this {
    this.endtime = process.hrtime(this.starttime);
    return this;
  }

  get elapsed() {
    return this.endtime[0] * 1e3 + this.endtime[1] / 1e6;
  }
}

export class Timeout<T> {
  private timer;
  private timeoutCallback: () => any;
  private finishCallback: () => any;

  constructor(private promise: Promise<T>,
              private ms: number) {
  }

  async start() {
    return new Promise<T>((resolve, reject) => {
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        resolve(this.timeoutCallback());
      }, this.ms);

      if (this.finishCallback) {
        this.promise.then(this.finishCallback);
      }
      this.promise.then(resolve, reject);
    });
  }

  cancel(): void {
    clearTimeout(this.timer);
  }

  timeout(callback: () => any): this {
    this.timeoutCallback = callback;

    return this;
  }

  finish(callback: () => any): this {
    this.finishCallback = callback;

    return this;
  }

}
