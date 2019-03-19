import {Injectable} from "@nestjs/common";

@Injectable()
export class ApplicationConfigurationService {

  private packageInfo = require("../../package.json");
  private configInfo = require("../../config.json");

  constructor() {
  }

  get version(): string {
    return this.packageInfo.version;
  }

  get value(): any {
    return this.configInfo;
  }
}
