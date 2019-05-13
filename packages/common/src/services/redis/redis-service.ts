import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "../logging";
import * as Redis from "ioredis";
import {SubscribeChannel} from "./subscribe-channel";

export interface IRedisOption {
  host: string;
  port: number;
}

export interface IRedisPubSubMessage {
  command: string;
  message?: string;
}

@Injectable()
export class RedisService {
  private client: Redis.Redis;
  private option: IRedisOption;

  constructor(private logger: ApplicationLoggerService) {
  }

  async connect(option: IRedisOption) {
    this.option = option;

    try {
      this.client = await this._connect(option);
    } catch (e) {
      if (e.message === "Redis is already connecting/connected") return;

      throw e;
    }
  }

  set(key: string, value: any): Promise<any> {
    if (!this.client)
      throw new Error("client is undefined");

    return new Promise<any>((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), (error, res) => {
        if (error) {
          return reject(error);
        }

        this.logger.info(`redis-service: set key=${key}, value=${JSON.stringify(value)}, res=${JSON.stringify(res)}`);
        resolve(res);
      });
    });
  }

  get(key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.client.get(key, (error, res) => {
        if (error) {
          return reject(error);
        }

        this.logger.info(`redis-service: get key=${key}, res=${res}`);
        resolve(JSON.parse(res || ""));
      });
    });
  }

  subscribe(key: string): Promise<SubscribeChannel> {
    this.logger.info(`redis-service: subscribe key=${key}`);

    return new Promise<SubscribeChannel>(async (resolve) => {
      const client = await this._connect(this.option);

      // client.subscribe(key);
      // client.on("message", (channel, message) => {
      //   this.logger.info(`ioredis: ${channel}, ${message}`);
      //   if (key === channel) {
      //     this.logger.info(`redis-service: subscribe.message message=${message}`);
      //
      //     const packet = <IRedisPubSubMessage>JSON.parse(message);
      //     resolve(packet);
      //   }
      // });

      const channel = new SubscribeChannel(client, key, this.logger);
      resolve(channel);
    });
  }

  unsubscribe(key: string): Promise<void> {
    this.logger.info(`redis-service: unsubscribe key=${key}`);

    return new Promise<void>((resolve) => {
      this.client.removeAllListeners();
      this.client.unsubscribe(key);
      resolve();
    });
  }

  publish(key: string, value: IRedisPubSubMessage): Promise<number> {
    this.logger.info(`redis-service: publish key=${key}, value=${JSON.stringify(value)}`);

    return new Promise<number>((resolve, reject) => {
      this.client.publish(key, JSON.stringify(value), (err, res) => {
        if (err) {
          return reject(err);
        }

        this.logger.info(`redis-service: publish.callback res=${JSON.stringify(res)}`);
        resolve(res);
      });
    });
  }

  del(key: string): Promise<number> {
    this.logger.info(`redis-service: del key=${key}`);

    return this.client.del(key);
  }

  async close() {
    if (!this.client) return;

    this.client.disconnect();
    return Promise.resolve();
  }

  private async _connect(option: IRedisOption): Promise<Redis.Redis> {
    const client = new Redis({
      host: option.host,
      port: option.port,
      connectTimeout: 2000
    });

    // client.on("connect", () => {
    //   this.logger.info("redis connect");
    // });
    // client.on("ready", () => {
    //   this.logger.info("redis ready");
    //   resolve(client);
    // });
    // client.on("error", (e) => {
    //   this.logger.info("redis error");
    //   reject(e);
    // });
    // client.on("close", () => {
    //   this.logger.info("redis close");
    // });
    // client.on("reconnecting", () => {
    //   this.logger.info("redis reconnecting");
    // });
    // client.on("end", () => {
    //   this.logger.info("redis end");
    // });

    return client;
  }

}
