import {Injectable} from "@nestjs/common";
import {
  CommandLineAction,
  CommandLineIntegerParameter
} from "@microsoft/ts-command-line/lib";
import {
  ApplicationBootstrapperService,
  ApplicationConfigurationService,
} from "@app/services/configurations";
import {ApplicationLoggerService} from "@app/services/logging";
import {ApplicationService,} from "@app/services/application";

@Injectable()
export class RunAction extends CommandLineAction {

  private port: CommandLineIntegerParameter;

  constructor(private logger: ApplicationLoggerService,
              private bootstrapper: ApplicationBootstrapperService,
              private config: ApplicationConfigurationService,
              private application: ApplicationService) {
    super({
      actionName: "run",
      documentation: "Run powerjudge-server.ts",
      summary: ""
    });
  }

  protected onDefineParameters(): void {
    this.port = this.defineIntegerParameter({
      parameterLongName: "--port",
      parameterShortName: "-p",
      description: "Port number",
      defaultValue: 8080,
      argumentName: "PORT"
    });
  }

  protected async onExecute(): Promise<void> {
    this.logger.info(`Run ${this.config.config.name} ${this.config.version}.`);

    await this.run();
    return Promise.resolve();
  }

  private async run(): Promise<void> {
    const result = await this.bootstrapper.checkAsync();
    if (!result) {
      this.logger.error("The program can not be executed.");
      return;
    }

    this.logger.info(`Running server: ${this.port.value} port.`);
    this.application.run(this.port.value);
  }

}
