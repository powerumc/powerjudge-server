import {createDecorator, register} from "@app";

interface IConfig {
  name: string;
}

@register().isSingleton()
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

export const IApplicationConfigurationService = createDecorator(ApplicationConfigurationService);
