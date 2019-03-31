import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, RedisService, IBrokerMessage, IFilesRequest, IExecuteResult} from "powerjudge-common";
import {ApplicationConfigurationService} from "../configurations";
import {CompileService} from "./compile-service";

@Injectable()
export class JudgeService {

  constructor(private logger: ApplicationLoggerService,
              private redis: RedisService,
              private config: ApplicationConfigurationService,
              private compile: CompileService) {

  }

  async process(message: IBrokerMessage): Promise<void> {
    const request = await this.pick(message);
    const result = await this.compile.run(message, request);

    await this.publish(message, result);
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

  private async publish(message: IBrokerMessage, result: IExecuteResult) {
    await this.redis.publish(message.id, JSON.stringify(result));
  }


}
