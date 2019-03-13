import {Injectable} from "@nestjs/common";

interface IConfig {
  name: string;
}

@Injectable()
export class ApplicationConfigurationService {

  private packageInfo = require("../../../package.json");
  private configInfo = require("../../../config.json");

  constructor() {
  }

  get version(): string {
    return this.packageInfo.version;
  }

  get config(): IConfig {
    return this.configInfo;
  }
}
