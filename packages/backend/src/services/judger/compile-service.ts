import * as fs from "fs";
import * as _ from "lodash";
import * as npath from "path";
import * as child from "child_process";
import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, IFilesRequest, FsUtils, IBrokerMessage, IFile, StopWatch} from "powerjudge-common";
import {DockerService} from "../docker";
import {ApplicationConfigurationService} from "../configurations";
import {CompileMappingService} from "./compile-mapping-service";
import MemoryStream = require("memorystream");
import * as Dockerode from "dockerode";

@Injectable()
export class CompileService {

  constructor(private logger: ApplicationLoggerService,
              private docker: DockerService,
              private config: ApplicationConfigurationService,
              private compileMapping: CompileMappingService) {
  }

  async compile(message: IBrokerMessage, request: IFilesRequest) {
    this.logger.info(`compile-service: compile message=${JSON.stringify(message)}, request=${JSON.stringify(request)}`);

    try {
      await this.writeFiles(message, request);

      const path = npath.resolve(this.getPrivilegeRoot(message));
      const mapping = this.compileMapping.get(request.language);
      const container = await this.docker.create(message.id, mapping.image, path, "/pj");
      await this.docker.start(container);
      await this._compileByChildProcess(container);


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

  private async _compileByChildProcess(container: Dockerode.Container) {
    const stopwatch = StopWatch.start();
    this.logger.info(`compile-service: _compile container=${container.id}`);

    try {
      const cmd = `docker exec ${container.id} ls -al /`;
      const proc = child.exec(cmd, (error, stdout, stderr) => {
        this.logger.info(`compile-service: _compileByChildProcess error=${error}`);
        this.logger.info(`compile-service: _compileByChildProcess stdout=${stdout}`);
        this.logger.info(`compile-service: _compileByChildProcess stderr=${stderr}`);

        this.logger.info(`compile-service: _compileByChildProcess end container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
      });
    } finally {
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
}
