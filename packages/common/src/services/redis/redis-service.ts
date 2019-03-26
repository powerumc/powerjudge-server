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

  constructor(private logger: ApplicationLoggerService) {
  }

  async connect(option: IRedisOption) {
    try {
      this.client = new Redis({
        host: option.host,
        port: option.port,
        connectTimeout: 2000
      });

      await this.client.connect();
    } catch(e) {
      if (e.message === "Redis is already connecting/connected") return;

      throw e;
    }
  }

  set(key: string, value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), (error, res) => {
        if (error) {
          return reject(error);
        }

        this.logger.info(`redis-service: set key:${key}, value: ${JSON.stringify(value)}`);
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

        resolve(JSON.parse(res || ""));
      });
    });
  }

  subscribe(key: string): Promise<any> {
    return new Promise<any>((resolve) => {
      this.client.subscribe(key);
      this.client.on("message", (channel, message) => {
        this.logger.info(`ioredis: ${channel}, ${message}`);
        if (key === channel) {
          this.client.unsubscribe(key);
          resolve(JSON.parse(message));
        }
      });
    });
  }

  async close() {
    if (!this.client) return;

    this.client.disconnect();
  }

}
