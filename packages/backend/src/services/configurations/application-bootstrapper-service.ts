import {Injectable} from "@nestjs/common";
import {DockerService} from "../docker";
import {ApplicationLoggerService, IBrokerOption} from "powerjudge-common";
import {sync} from "command-exists";
import {ApplicationConfigurationService} from "./application-configuration-service";
import {BrokerConsumerService} from "../broker";

export interface IBootstrapperResult {
  result: boolean;
  detail: {
    docker: {
      installed: boolean;
      connectable: boolean;
    },
    broker: {
      connectable: boolean;
    }
  }
}

@Injectable()
export class ApplicationBootstrapperService {
  private readonly option: IBrokerOption;

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private docker: DockerService,
              private consumer: BrokerConsumerService) {
    this.option = <IBrokerOption>this.config.value.servers.broker;
  }

  async check(): Promise<IBootstrapperResult> {
    let result: IBootstrapperResult = {
      result: false,
      detail: {
        docker: {
          installed: false,
          connectable: false
        },
        broker: {
          connectable: false
        }
      }
    };

    try {
      await this.checkDockerInstalled(result);
      await this.checkDockerConnect(result);
      await this.checkBrokerConnectable(result);
    } catch(e) {
      this.logger.error(e);
    } finally {
      result.result = result.detail.docker.installed
        && result.detail.docker.connectable
        && result.detail.broker.connectable;
    }

    return result;
  }

  private async checkDockerInstalled(result: IBootstrapperResult) {
    result.detail.docker.installed = sync("docker");
  }

  private async checkDockerConnect(result: IBootstrapperResult) {
    try {
      if (await this.docker.info()) {
        result.detail.docker.connectable = true;
      }
    } catch (e) {
    }
  }

  private async checkBrokerConnectable(result: IBootstrapperResult) {
    try {
      await this.consumer.connect(this.option);
      result.detail.broker.connectable = true;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
