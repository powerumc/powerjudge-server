import {Injectable} from "@nestjs/common";
import {
  ApplicationLoggerService,
  BrokerProducerService,
  IBrokerOption,
  IRedisOption,
  RedisService,
  MongoService,
  IMongoOption
} from "powerjudge-common";
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
    },
    mongo: {
      connectable: boolean;
    }
  }
}

@Injectable()
export class ApplicationBootstrapperService {

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private producer: BrokerProducerService,
              private redis: RedisService,
              private mongo: MongoService) {
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
        },
        mongo: {
          connectable: false
        }
      }
    };
    const brokerOption = <IBrokerOption>this.config.value.servers.broker;
    await this.checkBrokerConnectable(brokerOption, result);
    await this.checkBrokerTopicExists(brokerOption, result);

    const redisOption = <IRedisOption>this.config.value.servers.redis;
    await this.checkRedisConnectable(redisOption, result);

    const mongoOption = <IMongoOption>this.config.value.servers.mongo;
    await this.checkMongoConnectable(mongoOption, result);

    result.result = result.detail.broker.connectable
      && result.detail.redis.connectable
      && result.detail.mongo.connectable;

    if (!result.result) {
      await this.close();
    } else {
      process.on("exit", async code => {
        await this.close();
      });
      process.on("SIGINT", async () => {
        await this.close();
      });
    }

    return result;
  }

  async close() {
    await this.producer.close();
    await this.redis.close();
    await this.mongo.close();
  }

  private async checkBrokerConnectable(option: IBrokerOption, result: IBootstrapperResult) {
    try {
      await this.producer.connect(option);
      await this.producer.refreshMetadata(option.topic.name);
      result.detail.broker.connectable = true;
    } catch (e) {
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

    } catch (e) {
      this.logger.error(e);
    }
  }

  private async checkRedisConnectable(redisOption: IRedisOption, result: IBootstrapperResult) {
    try {
      await this.redis.connect(redisOption);
      result.detail.redis.connectable = true;
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async checkMongoConnectable(mongoOption: IMongoOption, result: IBootstrapperResult) {
    try {
      await this.mongo.connect(mongoOption);
      result.detail.mongo.connectable = true;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
