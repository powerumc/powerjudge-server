import {Body, Controller, Post} from "@nestjs/common";
import {
  ApplicationLoggerService,
  BrokerProducerService,
  CodesModel,
  IBrokerMessage,
  IExecuteResult,
  IFilesRequest,
  IRedisPubSubMessage,
  MongoService,
  RedisService,
  Timeout,
  IFilesResponse
} from "powerjudge-common";
import {Guid} from "guid-typescript";

@Controller("/api/v1/code")
export class CodeController {

  constructor(private logger: ApplicationLoggerService,
              private mongo: MongoService,
              private producer: BrokerProducerService,
              private redis: RedisService) {

  }

  @Post("run")
  async run(@Body() request: IFilesRequest): Promise<IFilesResponse | undefined> {
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
      const channel = await this.redis.subscribe(message.id, "api");
      await this.producer.send(message);

      return await new Timeout(new Promise<IFilesResponse>(resolve => {
        channel.on("message", (msg: IRedisPubSubMessage) => {
          switch (msg.command) {
            case "end":
              const executeResult = <IExecuteResult>JSON.parse(msg.message || "");
              return resolve({
                success: true,
                result: {
                  stderr: executeResult.stderr,
                  stdout: executeResult.stdout,
                  elapsed: executeResult.elapsed
                }
              });
            case "error":
              return resolve({
                success: false,
                result: msg.message
              });
          }
        });
      }), 1000 * 30)
        .timeout(() => {
          return {
            success: false,
            message: "timeout"
          }
        })
        .start();

      // await this.redis.set(message.id, request);
      // const subscribePromise = this.redis.subscribe(message.id);
      // await this.producer.send(message);
      //
      // const r = await new Timeout(new Promise(async (resolve, reject) => {
      //   while (true) {
      //     const subscribeResult = await subscribePromise;
      //     this.logger.info(JSON.stringify(subscribeResult));
      //
      //     if (subscribeResult.command === "end") {
      //       const executeResult = <IExecuteResult>JSON.parse(subscribeResult.message || "");
      //       return resolve({
      //         result: {
      //           stderr: executeResult.stderr,
      //           stdout: executeResult.stdout,
      //           elapsed: executeResult.elapsed
      //         },
      //         success: executeResult.success
      //       });
      //     } else if (subscribeResult.command === "error") {
      //       return resolve({
      //         success: false,
      //         result: subscribeResult.message
      //       })
      //     }
      //   }
      // }), 1000*30)
      //   .timeout(() => {
      //     return {
      //       success: false,
      //       message: "Timeout"
      //     };
      //   })
      //   .start();
      //
      // return r;

    } catch(e) {
      this.logger.error(e);
    }
  }

}
