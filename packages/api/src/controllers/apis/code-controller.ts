import {Body, Controller, Post} from "@nestjs/common";
import {ApplicationLoggerService, MongoService, BrokerProducerService, RedisService, IFilesRequest, CodesModel, IBrokerMessage} from "powerjudge-common";
import {Guid} from "guid-typescript";

@Controller("/api/code")
export class CodeController {

  constructor(private logger: ApplicationLoggerService,
              private mongo: MongoService,
              private producer: BrokerProducerService,
              private redis: RedisService) {

  }

  @Post("run")
  async run(@Body() request: IFilesRequest) {
    try {
      this.logger.info(`code-controller.run: request=${JSON.stringify(request)}`);

      let model = new CodesModel({
        uid: Guid.create().toString(),
        language: request.language,
        files: request.files
      });
      const result = await model.save();
      const message: IBrokerMessage = {
        id: result._id.toString()
      };

      await this.redis.set(message.id, request);
      await this.producer.send(message);

      this.logger.info(await this.redis.subscribe(message.id));

      return result;
    } catch(e) {
      this.logger.error(e);
    }
  }

}
