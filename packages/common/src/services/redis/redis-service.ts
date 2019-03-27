import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "../logging";
import * as Redis from "ioredis";

export interface IRedisOption {
  host: string;
  port: number;
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
    } catch(e) {
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

        this.logger.info(`redis-service: get res=${res}`);
        resolve(JSON.parse(res || ""));
      });
    });
  }

  subscribe(key: string): Promise<any> {
    return new Promise<any>(async (resolve) => {
      this.logger.info(`redis-service: subscribe key=${key}`);

      const client = await this._connect(this.option);
      client.subscribe(key);
      client.on("message", (channel, message) => {
        this.logger.info(`ioredis: ${channel}, ${message}`);
        if (key === channel) {
          this.logger.info(`redis-service: subscribe.message message=${message}`);
          client.unsubscribe(key);
          client.removeAllListeners();
          client.disconnect();
          this.logger.info(`redis-service: unsubscribe key=${key}`);
          resolve(JSON.parse(message));
        }
      });
    });
  }

  async close() {
    if (!this.client) return;

    this.client.disconnect();
  }

  private async _connect(option: IRedisOption) {
    const client = new Redis({
      host: option.host,
      port: option.port,
      connectTimeout: 2000
    });

    await client.connect();
    return client;
  }

}
