import {INestApplication, Injectable} from "@nestjs/common";

@Injectable()
export class ApplicationService {

  private app: INestApplication;

  constructor() {
  }

  init(nest: INestApplication) {
    this.app = nest;
  }

  get(type) {
    return this.app.get(type);
  }

  async run(port: number | string) {
    process.on("SIGINT", async () => {
      await this.close();
    });

    await this.app.listenAsync(port);
  }

  async close() {
    await this.app.close();
  }

}
