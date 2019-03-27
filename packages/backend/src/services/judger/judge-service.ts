import * as fs from "fs";
import * as npath from "path";
import * as _ from "lodash";
import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, RedisService, FsUtils, IBrokerMessage, IFilesRequest, IFile} from "powerjudge-common";
import {ApplicationConfigurationService} from "../configurations";

@Injectable()
export class JudgeService {

  constructor(private logger: ApplicationLoggerService,
              private redis: RedisService,
              private config: ApplicationConfigurationService) {

  }

  async process(message: IBrokerMessage) {
    const request = await this.pick(message);
    await this.writeFiles(message, request);

    await this.publish(message);
  }

  async pick(message: IBrokerMessage): Promise<IFilesRequest> {
    this.logger.info(`judge-service.pick: message=${JSON.stringify(message)}`);

    const request = <IFilesRequest>await this.redis.get(message.id);
    this.logger.info(`judge-service.pick: request=${JSON.stringify(request)}`);
    await this.redis.del(message.id);

    return request;
  }

  private async publish(message: IBrokerMessage) {
    await this.redis.publish(message.id, JSON.stringify({result: "OK"}));
  }

  private async writeFiles(message: IBrokerMessage, request: IFilesRequest) {
    let path = this.config.value.servers.broker.consumer.data.path;
    path = npath.join(path, message.id);
    await FsUtils.mkdir(path);

    this.logger.info(`judge-service: writeFiles path=${path}, message=${message}, request=${JSON.stringify(request)}`);
    try {
      await this.recursiveFiles(request.files, path);
    } catch(e) {
      this.logger.error(e);
    }

  }

  private async recursiveFiles(files: IFile[], path: fs.PathLike) {
    for(const file of files) {
      const isFile = _.isString(file.value);

      if (isFile) {
        const filepath = npath.join(path.toString(), file.name);
        await FsUtils.write(filepath, file.value);
      } else {
        const childPath = npath.join(path.toString(), file.name);
        await FsUtils.mkdir(childPath);

        await this.recursiveFiles(<IFile[]>file.value, childPath);
      }
    }
  }
}
