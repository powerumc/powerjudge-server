import * as child from "child_process";
import * as npath from "path";
import * as _ from "lodash";
import * as Dockerode from "dockerode";
import {ICompileStrategy} from "./interfaces";
import {ICompilerMappingItem} from "../compile-mapping-service";
import {IFile, ApplicationLoggerService, IExecuteResult, StopWatch} from "powerjudge-common";
import {Injectable} from "@nestjs/common";

@Injectable()
export class DefaultCompileStrategyService implements ICompileStrategy {

  constructor(private logger: ApplicationLoggerService) {

  }

  compile(container: Dockerode.Container, message, request, mapping: ICompilerMappingItem): Promise<IExecuteResult> {
    const stopwatch = StopWatch.start();
    this.logger.info(`default-compile-strategy-service: _compile container=${container.id}`);

    return new Promise<IExecuteResult>((resolve, reject) => {
      try {
        const filePaths = [];
        this.getFilePaths(request.files, "./", filePaths);
        const defaultCompileOption = mapping.defaultCompileOption || "";
        const compileOption = (mapping.compileOption && mapping.compileOption!(filePaths)) || "";
        const joinOutputOption = mapping.joinOutputOption(mapping.out) || "";
        const compileCmd = `${mapping.compile} ${defaultCompileOption} ${compileOption} ${joinOutputOption}`;
        const dockerCmd = `docker exec ${container.id} ${compileCmd}`;
        this.logger.info(`compile-service: _compileByChildProcess dockerCmd=${dockerCmd}`);

        const proc = child.exec(dockerCmd, (error, stdout, stderr) => {
          this.logger.info(`compile-service: _compileByChildProcess container=${container.id}, error=${JSON.stringify({ error, stderr, stdout })}`);
          this.logger.info(`compile-service: _compileByChildProcess end container=${container.id}, elapsed=${stopwatch.end().elapsed}`);

          resolve({
            success: !error,
            stderr,
            stdout,
            elapsed: stopwatch.elapsed,
          });
        });
      }
      catch(e) {
        this.logger.error(e);
        reject(e);
      } finally {
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
