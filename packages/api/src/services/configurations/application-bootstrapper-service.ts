import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, BrokerProducerService, IBrokerOption} from "powerjudge-common";
import {ApplicationConfigurationService} from "./application-configuration-service";

export interface IBootstrapperResult {
  result: boolean;
  detail: {
    broker: {
      connectable: boolean;
      topicExists: boolean;
      topicCreated: boolean;
    }
  }
}

@Injectable()
export class ApplicationBootstrapperService {
  private readonly option: IBrokerOption;

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private producer: BrokerProducerService) {
    this.option = <IBrokerOption>this.config.value.servers.broker;
  }


  async check(): Promise<IBootstrapperResult> {
    let result: IBootstrapperResult = {
      result: false,
      detail: {
        broker: {
          connectable: false,
          topicExists: false,
          topicCreated: false
        }
      }
    };
    await this.checkBrokerConnectable(result);
    await this.checkBrokerTopicExists(result);

    result.result = result.detail.broker.connectable;

    return result;
  }

  private async checkBrokerConnectable(result: IBootstrapperResult) {
    try {
      await this.producer.connect(this.option);
      result.detail.broker.connectable = true;
    } catch(e) {
      this.logger.error(e);
    }
  }

  private async checkBrokerTopicExists(result: IBootstrapperResult) {
    try {
      result.detail.broker.topicExists = await this.producer.topicExists(this.option.topic.name);

      if (!result.detail.broker.topicExists) {
        await this.producer.createTopic(this.option.topic.name);
        result.detail.broker.topicCreated = true;
      }

    } catch(e) {
      this.logger.error(e);
    }
  }
}
