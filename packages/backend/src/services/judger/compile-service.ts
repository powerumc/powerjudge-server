import * as fs from "fs";
import * as _ from "lodash";
import * as npath from "path";
import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, IFilesRequest, FsUtils, IBrokerMessage, IFile} from "powerjudge-common";
import {DockerService} from "../docker";
import {ApplicationConfigurationService} from "../configurations";
import {CompileMappingService} from "./compile-mapping-service";

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
      const stream = await container.attach(container);
      container.modem.demuxStream(stream, process.stdout, process.stderr);

      stream.on("data", (data) => { this.logger.info(data); });
      stream.on("error", () => { this.logger.error("error"); });
      stream.on("end", () => { this.logger.info("end"); });
      stream.write("ls -al\n");

      await container.wait();

    } finally {
      // await this.removeFiles(message);
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
