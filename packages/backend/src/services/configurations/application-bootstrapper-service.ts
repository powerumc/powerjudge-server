import {Injectable} from "@nestjs/common";
import {DockerService} from "../docker";
import {ApplicationLoggerService} from "powerjudge-common";
import {sync} from "command-exists";
import {KafkaClient} from "kafka-node";
import {ApplicationConfigurationService} from "./application-configuration-service";

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

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private docker: DockerService) {
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
    await this.checkDockerInstalled(result);
    await this.checkDockerConnect(result);
    await this.checkBrokerConnectable(result);

    result.result = result.detail.docker.installed
      && result.detail.docker.connectable
      && result.detail.broker.connectable;

    return result;
  }

  private async checkDockerInstalled(result: IBootstrapperResult): Promise<void> {
    result.detail.docker.installed = sync("docker");
  }

  private async checkDockerConnect(result: IBootstrapperResult): Promise<void> {
    try {
      if (await this.docker.info()) {
        result.detail.docker.connectable = true;
      }
    } catch (e) {
    }
  }

  private checkBrokerConnectable(result: IBootstrapperResult): Promise<void> {
    const value = this.config.value.servers.broker;
    const client = new KafkaClient({
      kafkaHost: `${value.host}:${value.port}`
    });

    return new Promise<void>(resolve => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        resolve();
      }, 2000);

      try {
        client.connect();
        client.on("connect", () => {
          clearTimeout(timeoutId);
          result.detail.broker.connectable = true;
          client.close();
          resolve();
        });
      } catch(e) {
        this.logger.error(e);
        resolve();
      }
      finally {
      }
    });
  }
}
