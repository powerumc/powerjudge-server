import {Injectable} from "@nestjs/common";
import {DockerService} from "../docker";
import {
  ApplicationLoggerService,
  IBrokerOption,
  IMongoOption,
  IRedisOption,
  MongoService,
  RedisService
} from "powerjudge-common";
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
  private readonly option: IBrokerOption;

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private docker: DockerService,
              private consumer: BrokerConsumerService,
              private redis: RedisService,
              private mongo: MongoService) {
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
        },
        redis: {
          connectable: false
        },
        mongo: {
          connectable: false
        }
      }
    };

    await this.checkDockerInstalled(result);
    await this.checkDockerConnect(result);

    const brokerOption = <IBrokerOption>this.config.value.servers.broker;
    await this.checkBrokerConnectable(brokerOption, result);

    const redisOption = <IRedisOption>this.config.value.servers.redis;
    await this.checkRedisConnectable(redisOption, result);

    const mongoOption = <IMongoOption>this.config.value.servers.mongo;
    await this.checkMongoConnectable(mongoOption, result);

    result.result = result.detail.docker.installed
      && result.detail.docker.connectable
      && result.detail.broker.connectable
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
    await this.consumer.close();
    await this.mongo.close();
    await this.redis.close();
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

  private async checkBrokerConnectable(option: IBrokerOption, result: IBootstrapperResult) {
    try {
      await this.consumer.connect(option);
      result.detail.broker.connectable = true;
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
