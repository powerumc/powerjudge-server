import * as child from "child_process";
import MemoryStream = require("memorystream");
import * as _ from "lodash";
import * as npath from "path";
import {Injectable} from "@nestjs/common";
import {IExecuteStrategy} from "./interfaces";
import * as Dockerode from "dockerode";
import {ICompilerMappingItem} from "../compile-mapping-service";
import {IExecuteResult, ApplicationLoggerService, IFile, StopWatch, SubscribeChannel} from "powerjudge-common";

@Injectable()
export class InteractiveExecuteStrategyService implements IExecuteStrategy {

  constructor(private logger: ApplicationLoggerService) {

  }

  execute(container: Dockerode.Container, request, mapping: ICompilerMappingItem, channel: SubscribeChannel): Promise<IExecuteResult> {
    const stopwatch = StopWatch.start();
    this.logger.info(`compile-service: execute request=${JSON.stringify(request)}`);

    return new Promise<IExecuteResult>(async (resolve, reject) => {
      try {
        const attachStream = await container.attach({});
        const ms = new MemoryStream();
        attachStream.pipe(ms);
        container.modem.demuxStream(ms, process.stdout, process.stderr);

        attachStream.on("data", data => {
          ms.write(data);
          channel.send({
            command: "stdout",
            message: data,
            sender: "backend"
          });
        });
        attachStream.on("error", error => {
          ms.write(error);
          channel.send({
            command: "stderr",
            message: error,
            sender: "backend"
          });
        });
        attachStream.on("end", () => {
          this.logger.info("interactive-execute-strategy-service: execute end");
          ms.end();
        });

        await container.wait();
        stopwatch.end();
        this.logger.info(`interactive-execute-strategy-service: execute end container=${container.id}, elapsed=${stopwatch.elapsed}`);

      } catch (e) {
        this.logger.error(e);
        reject(e);
      }
      // try {
      //   const filePaths = [];
      //   this.getFilePaths(request.files, "./", filePaths);
      //
      //   const runtimeCmd = `${mapping.runtime} ${mapping.runtimeOption(filePaths)}`;
      //   const dockerCmd = `docker exec ${container.id} ${runtimeCmd}`;
      //   this.logger.info(`compile-service: execute container=${container.id}, dockerCmd=${dockerCmd}`);
      //
      //   const proc = child.exec(dockerCmd, (error, stdout, stderr) => {
      //     this.logger.info(`compile-service: execute child.exec container=${container.id}, error=${JSON.stringify({error, stderr, stdout})}`);
      //     this.logger.info(`compile-service: execute child.exec end container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
      //
      //     resolve({
      //       stderr,
      //       stdout,
      //       success: !error,
      //       elapsed: stopwatch.elapsed
      //     })
      //   });
      // } catch(e) {
      //   this.logger.error(e);
      //   reject(e);
      // }
    });
  }

  private getFilePaths(files: IFile[], path: string, list: string[]) {
    for(const file of files) {
      const isFile = _.isString(file.value);

      if (isFile) {
        list.push(npath.join(path, file.name));
      } else {
        this.getFilePaths(<IFile[]>file.value, npath.join(path, file.name), list);
      }
    }
  }

}
