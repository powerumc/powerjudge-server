import {Injectable} from "@nestjs/common";
import * as npath from "path";
import {IBrokerMessage} from "powerjudge-common";

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

  getPrivilegeRoot(message: IBrokerMessage): string {
    let path = this.value.servers.broker.consumer.data.path;
    path = npath.join(path, message.id);

    return path;
  }
}
