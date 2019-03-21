import * as fs from "fs";

export class NumberUtils {
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
}


export class FsUtils {
  static mkdir(path: fs.PathLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const exists = fs.existsSync(path);
        if (!exists) {
          fs.mkdir(path, {
            recursive: true
          }, error => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          })
        }
      } catch(e) {
        reject(e);
      }
    });
  }
}
