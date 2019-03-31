import * as fs from "fs";
import * as _ from "lodash";
import * as npath from "path";
import * as child from "child_process";
import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, IFilesRequest, FsUtils, IBrokerMessage, IFile, StopWatch, IExecuteResult} from "powerjudge-common";
import {DockerService} from "../docker";
import {ApplicationConfigurationService} from "../configurations";
import {CompileMappingService, ICompilerMappingItem} from "./compile-mapping-service";
import MemoryStream = require("memorystream");
import * as Dockerode from "dockerode";

@Injectable()
export class CompileService {

  constructor(private logger: ApplicationLoggerService,
              private docker: DockerService,
              private config: ApplicationConfigurationService,
              private compileMapping: CompileMappingService) {
  }

  async run(message: IBrokerMessage, request: IFilesRequest): Promise<IExecuteResult> {
    try {
      const mapping = this.compileMapping.get(request.language);

      const container = await this.compile(message, request, mapping);

      try {
        const result = await this.execute(container, request, mapping);
        return result;
      } finally {
        await this.remove(container);
      }

    } finally {
      await this.removeFiles(message);
    }
  }

  async compile(message: IBrokerMessage, request: IFilesRequest, mapping: ICompilerMappingItem): Promise<Dockerode.Container> {
    this.logger.info(`compile-service: compile message=${JSON.stringify(message)}, request=${JSON.stringify(request)}`);

    try {
      await this.writeFiles(message, request);

      const path = npath.resolve(this.getPrivilegeRoot(message));
      const container = await this.docker.create(message.id, mapping.image, path, "/pj");
      await this.docker.start(container);
      await this._compileByChildProcess(container, request, mapping);

      return container;
    }
    catch(e) {
      this.logger.error(e);
      throw e;
    } finally {
      // await this.removeFiles(message);
    }
  }

  private async _compile(container: Dockerode.Container) {
    const stopwatch = new StopWatch().start();

    this.logger.info(`compile-service: _compile container=${container.id}`);

    const attachStream = await this.docker.attach(container);
    const ms = new MemoryStream();
    attachStream.pipe(ms);

    // container.modem.demuxStream(ms, process.stdout, process.stderr);

    // attachStream.on("data", (data) => {
    //   ms.write(data);
    // });
    // attachStream.on("error", (error) => {
    //   ms.write(error);
    // });
    attachStream.on("end", () => {
      this.logger.info("end");
      ms.end();
    });

    await container.wait();
    stopwatch.end();
    this.logger.info(`compile-service: _compile end container=${container.id}, elapsed=${stopwatch.elapsed}`);
  }

  private _compileByChildProcess(container: Dockerode.Container, request: IFilesRequest, mapping: ICompilerMappingItem): Promise<void> {
    const stopwatch = StopWatch.start();
    this.logger.info(`compile-service: _compile container=${container.id}`);

    return new Promise<void>((resolve, reject) => {
      try {
        const filePaths = [];
        this.getFilePaths(request.files, "./", filePaths);
        const compileCmd = `${mapping.compile} ${mapping.compileOption(filePaths)} ${mapping.joinOutputOption(mapping.out)}`;
        const dockerCmd = `docker exec ${container.id} ${compileCmd}`;
        this.logger.info(`compile-service: _compileByChildProcess dockerCmd=${dockerCmd}`);

        const proc = child.exec(dockerCmd, (error, stdout, stderr) => {
          this.logger.info(`compile-service: _compileByChildProcess container=${container.id}, error=${JSON.stringify({ error, stderr, stdout })}`);
          this.logger.info(`compile-service: _compileByChildProcess end container=${container.id}, elapsed=${stopwatch.end().elapsed}`);

          resolve();
        });
      }
      catch(e) {
        this.logger.error(e);
        reject(e);
      } finally {
      }
    });
  }

  execute(container: Dockerode.Container, request: IFilesRequest, mapping: ICompilerMappingItem): Promise<IExecuteResult> {
    this.logger.info(`compile-service: execute request=${JSON.stringify(request)}`);

    return new Promise<IExecuteResult>((resolve, reject) => {
      try {
        const filePaths = [];
        this.getFilePaths(request.files, "./", filePaths);

        const runtimeCmd = `${mapping.runtime} ${mapping.runtimeOption(filePaths)}`;
        const dockerCmd = `docker exec ${container.id} ${runtimeCmd}`;
        this.logger.info(`compile-service: execute container=${container.id}, dockerCmd=${dockerCmd}`);

        const proc = child.exec(dockerCmd, (error, stdout, stderr) => {
          this.logger.info(`compile-service: execute child.exec container=${container.id}, error=${JSON.stringify({error, stderr, stdout})}`);

          if (error) {
            return reject(error);
          }

          resolve({
            stderr,
            stdout
          })
        });
      } catch(e) {
        this.logger.error(e);
        reject(e);
      }
    });
  }

  async remove(container: Dockerode.Container): Promise<void> {
    try {
      await this.docker.remove(container);
    } catch(e) {
      this.logger.error(e);
    }
  }

  private async removeFiles(message: IBrokerMessage) {
    const path = this.getPrivilegeRoot(message);

    this.logger.info(`judge-service: removeFiles message:${JSON.stringify(message)}, path=${path}`);
    await FsUtils.rmdir(path);
  }

  private async writeFiles(message: IBrokerMessage, request: IFilesRequest) {
    const path = this.getPrivilegeRoot(message);
    await FsUtils.mkdir(path);

    this.logger.info(`judge-service: writeFiles path=${path}, message=${JSON.stringify(message)}, request=${JSON.stringify(request)}`);
    try {
      await this.recursiveFiles(request.files, path);
    } catch(e) {
      this.logger.error(e);
    }

  }

  private async recursiveFiles(files: IFile[], path: fs.PathLike) {
    for(const file of files) {
      try {
        const isFile = _.isString(file.value);

        if (isFile) {
          const filepath = npath.join(path.toString(), file.name);
          await FsUtils.write(filepath, file.value);
        } else {
          const childPath = npath.join(path.toString(), file.name);
          await FsUtils.mkdir(childPath);

          await this.recursiveFiles(<IFile[]>file.value, childPath);
        }
      } catch(e) {
        console.error(e);
      }
    }
  }

  private getPrivilegeRoot(message: IBrokerMessage) {
    let path = this.config.value.servers.broker.consumer.data.path;
    path = npath.join(path, message.id);

    return path;
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
