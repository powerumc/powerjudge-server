import {Injectable} from "@nestjs/common";
import {KafkaClient, Producer} from "kafka-node";
import {IDisposable} from "../../interfaces";
import {NumberUtils} from "../../utils";
import {ApplicationLoggerService} from "../logging";
import {IBrokerMessage} from "./interfaces";

export interface IBrokerOption {
  hosts: string;
  topic: {
    name: string;
    partitions: number;
  },
  consumer: {
    data: {
      path: string;
    }
  }
}


@Injectable()
export class BrokerProducerService implements IDisposable {

  private option: IBrokerOption;
  private client: KafkaClient;
  private producer: Producer;
  private isReady: boolean;

  constructor(private logger: ApplicationLoggerService) {

  }

  async connect(option: IBrokerOption): Promise<void> {
    if (this.client) {
      return Promise.resolve();
    }

    this.option = option;

    this.client = new KafkaClient({
      autoConnect: true,
      connectRetryOptions: {
        retries: 3
      },
      connectTimeout: 3000
    });

    return new Promise<void>((resolve, reject) => {
      //this.client.connect();
      this.client.on("close", () => {
        this.logger.info("broker close");
      });
      this.client.on("brokersChanged", () => {
        this.logger.info("broker brokersChanged");
      });
      this.client.on("ready", async () => {
        this.logger.info("broker ready");

        if (this.isReady)
          resolve();

        this.isReady = true;

        this.producer = new Producer(this.client, {
          requireAcks: 1,
          ackTimeoutMs: 100
        });

        resolve();
      });
      this.client.on("zkReconnect", () => {
        this.logger.info("broker zkReconnect");
      });
      this.client.on("socket_error", (error) => {
        this.logger.error(error);
        reject(error);
      });
      this.client.on("error", (error) => {
        this.logger.error(error);
        reject(error);
      });
      this.client.on("connect", () => {
        this.logger.info("broker connect");

        if (this.isReady)
          resolve();
      });
    });
  }

  createTopic(topicName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.createTopics([
        {
          topic: topicName,
          partitions: this.option.topic.partitions,
          replicationFactor: 1,
          configEntries: [
            {
              name: 'compression.type',
              value: 'gzip'
            }
          ]
        }
      ], (error, result) => {
        if (error) {
          this.logger.error(error);
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  topicExists(topicName: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.client.topicExists([topicName], error => {
        if (error) {
          return resolve(false);
        }

        resolve(true);
      });
    });
  }

  send(message: IBrokerMessage): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.producer.send([{
        topic: this.option.topic.name,
        messages: JSON.stringify(message),
        partition: NumberUtils.random(1, this.option.topic.partitions)
      }], (error, data) => {
        if (error) {
          this.logger.error(error);
          return reject(error);
        }

        this.logger.info(`broker-producer-service: message=${JSON.stringify(message)}`);
        resolve(data);
      });
    });
  }

  dispose(): Promise<void> {
    return new Promise<void>(async resolve => {
      if (this.client) {
        this.client.removeAllListeners();
        await this.close();
        resolve();
      }
    });
  }

  close(): Promise<void> {
    return new Promise<void>(resolve => {
      this.producer.close(() => {
        this.client.close(() => resolve());
      });
    });
  }

  refreshMetadata(topicName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.client) {
        this.client.refreshMetadata([topicName], (error) => {
          if (error) {
            return reject(error);
          }

          resolve();
        })
      } else {
        reject(new Error("client is undefined"));
      }
    });
  }
}
