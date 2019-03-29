import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, RedisService, IBrokerMessage, IFilesRequest} from "powerjudge-common";
import {ApplicationConfigurationService} from "../configurations";
import {CompileService} from "./compile-service";

@Injectable()
export class JudgeService {

  constructor(private logger: ApplicationLoggerService,
              private redis: RedisService,
              private config: ApplicationConfigurationService,
              private compile: CompileService) {

  }

  async process(message: IBrokerMessage) {
    const request = await this.pick(message);
    await this.compile.compile(message, request);
    await this.publish(message);
  }

  async pick(message: IBrokerMessage): Promise<IFilesRequest> {
    this.logger.info(`judge-service.pick: message=${JSON.stringify(message)}`);

    const request = <IFilesRequest>await this.redis.get(message.id);
    this.logger.info(`judge-service.pick: request=${JSON.stringify(request)}`);
    if (request === null)
      throw new Error("request == null");

    await this.redis.del(message.id);

    return request;
  }

  private async publish(message: IBrokerMessage) {
    await this.redis.publish(message.id, JSON.stringify({result: "OK"}));
  }


}
