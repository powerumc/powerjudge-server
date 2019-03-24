import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "../logging";
import mongoose = require('mongoose');
import {Mongoose} from "mongoose";

export interface IMongoOption {
  uri: string;
  user: string;
  password: string;
}

@Injectable()
export class MongoService {
  private client: Mongoose;

  constructor(private logger: ApplicationLoggerService) {
  }

  async connect(option: IMongoOption) {
    try {
      this.client = await mongoose.connect(option.uri, {
        user: option.user,
        pass: option.password
      });
    } catch(e) {
      this.logger.error(e);
    }
  }

  async close() {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch(e) {
        this.logger.error(e);
      }
    }
  }

}
