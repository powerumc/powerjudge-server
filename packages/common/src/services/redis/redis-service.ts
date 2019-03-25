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

  async close() {
    if (!this.client) return;

    this.client.disconnect();
  }

}
