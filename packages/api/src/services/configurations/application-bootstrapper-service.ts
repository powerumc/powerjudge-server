import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "powerjudge-common";
import {KafkaClient} from "kafka-node";
import {ApplicationConfigurationService} from "./application-configuration-service";

export interface IBootstrapperResult {
  result: boolean;
  detail: {
    broker: {
      connectable: boolean;
    }
  }
}

@Injectable()
export class ApplicationBootstrapperService {

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService) {
  }


  async check(): Promise<IBootstrapperResult> {
    let result: IBootstrapperResult = {
      result: false,
      detail: {
        broker: {
          connectable: false
        }
      }
    };
    await this.checkBrokerConnectable(result);

    result.result = result.detail.broker.connectable;

    return result;
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
