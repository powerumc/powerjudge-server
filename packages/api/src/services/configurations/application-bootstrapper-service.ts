import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService, BrokerProducerService, IBrokerOption, IRedisOption, RedisService} from "powerjudge-common";
import {ApplicationConfigurationService} from "./application-configuration-service";

export interface IBootstrapperResult {
  result: boolean;
  detail: {
    broker: {
      connectable: boolean;
      topicExists: boolean;
      topicCreated: boolean;
    },
    redis: {
      connectable: boolean;
    }
  }
}

@Injectable()
export class ApplicationBootstrapperService {

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private producer: BrokerProducerService,
              private redis: RedisService) {
  }


  async check(): Promise<IBootstrapperResult> {
    let result: IBootstrapperResult = {
      result: false,
      detail: {
        broker: {
          connectable: false,
          topicExists: false,
          topicCreated: false
        },
        redis: {
          connectable: false
        }
      }
    };
    const brokerOption = <IBrokerOption>this.config.value.servers.broker;
    await this.checkBrokerConnectable(brokerOption, result);
    await this.checkBrokerTopicExists(brokerOption, result);

    const redisOption = <IRedisOption>this.config.value.servers.redis;
    await this.checkRedisConnectable(redisOption, result);

    result.result = result.detail.broker.connectable;

    return result;
  }

  private async checkBrokerConnectable(option: IBrokerOption, result: IBootstrapperResult) {
    try {
      await this.producer.connect(option);
      result.detail.broker.connectable = true;
    } catch(e) {
      this.logger.error(e);
    }
  }

  private async checkBrokerTopicExists(option: IBrokerOption, result: IBootstrapperResult) {
    try {
      result.detail.broker.topicExists = await this.producer.topicExists(option.topic.name);

      if (!result.detail.broker.topicExists) {
        await this.producer.createTopic(option.topic.name);
        result.detail.broker.topicCreated = true;
      }

    } catch(e) {
      this.logger.error(e);
    }
  }

  private async checkRedisConnectable(redisOption: IRedisOption, result: IBootstrapperResult) {
    try {
      await this.redis.connect(redisOption);
      result.detail.redis.connectable = true;
      await this.redis.close();
    } catch(e) {
      this.logger.error(e);
    }
  }
}
