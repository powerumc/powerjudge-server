import {SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse} from "@nestjs/websockets";
import {Client, Server} from "socket.io";
import {ApplicationLoggerService, BrokerProducerService, MongoService, RedisService, IFilesRequest, IBrokerMessage, CodesModel, Timeout, IRedisPubSubMessage, IExecuteResult} from "powerjudge-common";
import {Guid} from "guid-typescript";

@WebSocketGateway()
export class CodeGateway {

  constructor(private logger: ApplicationLoggerService,
              private mongo: MongoService,
              private producer: BrokerProducerService,
              private redis: RedisService) {

  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage("run")
  async run(client: Client, request: IFilesRequest): Promise<WsResponse<any> | undefined> {
    try {
      this.logger.info(`code-gateway.run: request=${JSON.stringify(request)}`);

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

      const response = await new Timeout(new Promise((resolve, reject) => {
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

      return {
        event: "run-result",
        data: response
      }
    } catch(e) {
      this.logger.error(e);
    }
  }
}
