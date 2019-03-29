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
