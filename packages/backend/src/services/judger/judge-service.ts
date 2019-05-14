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
    try {
      const request = await this.getBrokerMessage(message);
      const channel = await this.redis.subscribe(message.id, "backend");
      const result = await this.compile.run(message, request, channel);

      await this.redis.publish(message.id, {
        command: "end",
        message: JSON.stringify(result),
        sender: "backend"
      });
    } catch(e) {
      this.logger.error(e);
      await this.redis.publish(message.id, {
        command: "error",
        message: "internal server error",
        sender: "backend"
      });
    }
  }

  async getBrokerMessage(message: IBrokerMessage): Promise<IFilesRequest> {
    this.logger.info(`judge-service.pick: message=${JSON.stringify(message)}`);

    const request = <IFilesRequest>await this.redis.get(message.id);
    this.logger.info(`judge-service.pick: request=${JSON.stringify(request)}`);
    if (request === null)
      throw new Error("request == null");

    await this.redis.del(message.id);

    return request;
  }

}
