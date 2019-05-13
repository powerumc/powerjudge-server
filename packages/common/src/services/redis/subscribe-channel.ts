import {EventEmitter} from "events";
import * as Redis from "ioredis";
import {IRedisPubSubMessage} from "./redis-service";
import {ApplicationLoggerService} from "../logging";

export class SubscribeChannel extends EventEmitter {

  constructor(private client: Redis.Redis,
              private key: string,
              private logger: ApplicationLoggerService) {
    super();

    this.client.subscribe(key);
    this.client.on("message", this.onMessage.bind(this));
  }

  send(message: IRedisPubSubMessage): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.logger.info(`ioredis: ${this.key}, ${message}`);
      this.client.publish(this.key, JSON.stringify(message), (err, res) => {
        if (err) {
          return reject(err);
        }

        this.logger.info(`redis-service: publish.callback res=${JSON.stringify(res)}`);
        resolve(res);
      });
    });
  }

  onMessage(channel: string, message: string) {
    this.logger.info(`ioredis: subscribe-channel onMessage: ${channel}, ${message}`);
    super.emit("message", <IRedisPubSubMessage>JSON.parse(message));
  }
}
