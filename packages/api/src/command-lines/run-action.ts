import {Injectable} from "@nestjs/common";
import {
  CommandLineAction,
  CommandLineIntegerParameter
} from "@microsoft/ts-command-line/lib";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "../services/configurations";
import {DEFAULT_PORT} from "../constraints";
import {ApplicationService} from "../services/application";
import {ApplicationLoggerService} from "powerjudge-common";


@Injectable()
export class RunAction extends CommandLineAction {

  private port: CommandLineIntegerParameter;

  constructor(private logger: ApplicationLoggerService,
              private bootstrapper: ApplicationBootstrapperService,
              private config: ApplicationConfigurationService,
              private application: ApplicationService) {
    super({
      actionName: "run",
      documentation: "Run powerjudge-api-server",
      summary: ""
    });
  }

  protected onDefineParameters(): void {
    this.port = this.defineIntegerParameter({
      parameterLongName: "--port",
      parameterShortName: "-p",
      description: "port number",
      defaultValue: DEFAULT_PORT,
      argumentName: "NUMBER",
      environmentVariable: "PJ_PORT"
    });
  }

  protected async onExecute(): Promise<void> {
    this.logger.info(`Run ${this.config.value.name} ${this.config.version}.`);

    await this.run();
    return Promise.resolve();
  }

  private async run(): Promise<void> {
    const result = await this.check();
    if (!result) {
      this.logger.error("The program can not be executed.");
      return;
    }

    this.logger.info(`Running server: ${this.port.value} port.`);
    await this.application.run(<number>this.port.value);
  }

  private async check(): Promise<boolean> {
    this.logger.info("Detecting requirements.");

    const result = await this.bootstrapper.check();

    result.detail.docker && this.logger.info("\t- Checking Docker");
    result.detail.docker.installed ? this.logger.info("\t\t- Installed Docker.") : this.logger.info("Not installed Docker.");

    if (result.detail.docker.installed) {
      result.detail.docker.connectable ? this.logger.info("\t\t- Connected Docker.") : this.logger.info("Not connectable Docker.");
    }

    return result.result;
  }

}
