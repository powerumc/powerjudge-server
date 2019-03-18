import {INestApplication, INestExpressApplication, Injectable} from "@nestjs/common";

@Injectable()
export class ApplicationService {

  private app: INestApplication & INestExpressApplication;

  constructor() {
  }

  init(nest: INestApplication & INestExpressApplication) {
    this.app = nest;
  }

  get(type) {
    return this.app.get(type);
  }

  async run(port: number | string) {
    await this.app.listenAsync(port);
  }

}
