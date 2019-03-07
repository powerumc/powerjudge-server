import {createDecorator, register} from "../../decorators";

interface IConfig {
    name: string;
}

@register().isSingleton()
export class ApplicationConfiguration {

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

export const IApplicationConfiguration = createDecorator(ApplicationConfiguration);
