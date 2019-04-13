import {Body, Controller, Post} from "@nestjs/common";
import {ApplicationLoggerService, MongoService, BrokerProducerService, RedisService, IFilesRequest, CodesModel, IBrokerMessage, IRedisPubSubMessage, Timeout, IExecuteResult} from "powerjudge-common";
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
      const subscribePromise = this.redis.subscribe(message.id);
      await this.producer.send(message);

      const r = await new Timeout(new Promise(async (resolve, reject) => {
        while (true) {
          const subscribeResult = await subscribePromise;
          this.logger.info(JSON.stringify(subscribeResult));

          if (subscribeResult.command === "end") {
            const executeResult = <IExecuteResult>JSON.parse(subscribeResult.message || "");
            return resolve({
              result: {
                stderr: executeResult.stderr,
                stdout: executeResult.stdout,
                elapsed: executeResult.elapsed
              },
              success: executeResult.success
            });
          } else if (subscribeResult.command === "error") {
            return resolve({
              success: false,
              result: subscribeResult.message
            })
          }
        }
      }), 1000*30)
        .timeout(() => {
          return {
            success: false,
            message: "Timeout"
          };
        })
        .start();

      return r;

    } catch(e) {
      this.logger.error(e);
    }
  }

}
