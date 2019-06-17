import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "../logging";
import mongoose = require('mongoose');
import {ConnectionOptions, Mongoose} from "mongoose";

export interface IMongoOption {
  uri: string;
  user: string;
  password: string;
  db: string;
}

@Injectable()
export class MongoService {
  private client: Mongoose;

  constructor(private logger: ApplicationLoggerService) {
  }

  async connect(option: IMongoOption) {
    let mongooseOption: ConnectionOptions = {
      useNewUrlParser: true,
      connectTimeoutMS: 3000,
      user: option.user,
      pass: option.password
    };

    this.client = await mongoose.connect(option.uri, mongooseOption);
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
