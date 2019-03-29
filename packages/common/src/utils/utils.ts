import * as fs from "fs";
import rimraf = require("rimraf");

export class NumberUtils {
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}


export class FsUtils {
  static mkdir(path: fs.PathLike): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const exists = fs.existsSync(path);
      if (!exists) {
        fs.mkdir(path, {
          recursive: true
        }, error => {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
      }

      resolve();
    });
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
