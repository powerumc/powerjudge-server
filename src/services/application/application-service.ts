import {INestApplication, INestExpressApplication, Injectable} from "@nestjs/common";
import "@app/controllers/apis";
import {NestApplication, NestFactory} from "@nestjs/core";
import {AppModule} from "../../app-module";

@Injectable()
export class ApplicationService {

  private app: INestApplication & INestExpressApplication;

  constructor() {
  }

  async init() {
    this.app = await NestFactory.create(AppModule);
  }

  get<T>(type: any) {
    return this.app.get(type);
  }

  run(value: number | undefined) {
  }
}
