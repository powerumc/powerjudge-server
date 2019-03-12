import {
  CommandLineAction,
  CommandLineIntegerParameter
} from "@microsoft/ts-command-line/lib";
import {Container, decorate, injectable} from "inversify";
import {IContainer, register} from "@app";
import {
  ApplicationBootstrapperService,
  ApplicationConfigurationService, IApplicationBootstrapperService,
  IApplicationConfigurationService
} from "@app/services/configurations";
import {ApplicationLoggerService, IApplicationLoggerService} from "@app/services/logging";
import {ApplicationService, IApplicationService} from "@app/services/application";

decorate(injectable(), CommandLineAction);

@register().isSingleton()
export class RunAction extends CommandLineAction {

  private port: CommandLineIntegerParameter;

  constructor(@IContainer container: Container,
              @IApplicationLoggerService private logger: ApplicationLoggerService,
              @IApplicationBootstrapperService private bootstrapper: ApplicationBootstrapperService,
              @IApplicationConfigurationService private config: ApplicationConfigurationService,
              @IApplicationService private application: ApplicationService) {
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
