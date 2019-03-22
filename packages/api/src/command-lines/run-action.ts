import {Injectable} from "@nestjs/common";
import {
  CommandLineAction,
  CommandLineIntegerParameter
} from "@microsoft/ts-command-line/lib";
import {
  ApplicationBootstrapperService,
  ApplicationConfigurationService,
  IBootstrapperResult
} from "../services/configurations";
import {DEFAULT_PORT} from "../constraints";
import {ApplicationService, ApplicationLoggerService} from "powerjudge-common";


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
      environmentVariable: "PJ_API_PORT"
    });
  }

  protected async onExecute() {
    this.logger.info(`Run ${this.config.value.name} ${this.config.version}.`);

    await this.run();
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

    this.checkBroker(result);
    this.checkRedis(result);

    return result.result;
  }

  private checkBroker(result: IBootstrapperResult) {
    this.logger.info("\t- Broker");
    if (result.detail.broker) {
      result.detail.broker.connectable
        ? this.logger.info("\t\t- Connected")
        : this.logger.info("\t\t- Could not connect");

      result.detail.broker.topicExists
        ? this.logger.info("\t\t- Topic exists")
        : this.logger.info("\t\t- Topic not exists");

      result.detail.broker.topicCreated
        ? this.logger.info("\t\t- Created")
        : this.logger.info("\t\t- Pass");
    } else {
      this.logger.info("\t\t- Not configured");
    }
  }

  private checkRedis(result: IBootstrapperResult) {
    this.logger.info("\t- Redis");
    if (result.detail.redis) {
      result.detail.redis.connectable
        ? this.logger.info("\t\t- Connected")
        : this.logger.info("\t\t- Could not connect");
    } else {
      this.logger.info("\t\t- Not configured");
    }
  }
}
