import * as child from "child_process";
import * as Dockerode from "dockerode";
import * as _ from "lodash";
import * as npath from "path";
import {IExecuteStrategy} from "./interfaces";
import {ICompilerMappingItem} from "../compile-mapping-service";
import {ApplicationLoggerService, IExecuteResult, IFile, StopWatch, SubscribeChannel, IFilesRequest} from "powerjudge-common";
import {Injectable} from "@nestjs/common";

@Injectable()
export class DefaultExecuteStrategyService implements IExecuteStrategy {

  constructor(private logger: ApplicationLoggerService) {

  }

  execute(container: Dockerode.Container, request: IFilesRequest, mapping: ICompilerMappingItem, channel: SubscribeChannel): Promise<IExecuteResult> {
    const stopwatch = StopWatch.start();
    this.logger.info(`default-execute-strategy-service: execute request=${JSON.stringify(request)}`);

    return new Promise<IExecuteResult>((resolve, reject) => {
      try {
        const filePaths = [];
        this.getFilePaths(request.files, "./", filePaths);

        const runtimeOption = (mapping.runtimeOption && mapping.runtimeOption(filePaths, request.entry)) || "";
        const runtimeCmd = `${mapping.runtime} ${runtimeOption}`;
        const dockerCmd = `docker exec ${container.id} ${runtimeCmd}`;
        this.logger.info(`default-execute-strategy-service: execute container=${container.id}, dockerCmd=${dockerCmd}`);

        const proc = child.exec(dockerCmd, (error, stdout, stderr) => {
          this.logger.info(`default-execute-strategy-service: execute child.exec container=${container.id}, error=${JSON.stringify({error, stderr, stdout})}`);
          this.logger.info(`default-execute-strategy-service: execute child.exec end container=${container.id}, elapsed=${stopwatch.end().elapsed}`);

          resolve({
            stderr,
            stdout,
            success: !error,
            elapsed: stopwatch.elapsed
          });
        });
      } catch(e) {
        this.logger.error(e);
        reject(e);
      }
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
