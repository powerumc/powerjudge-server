import {Injectable} from "@nestjs/common";
import {KafkaClient, Producer} from "kafka-node";
import {IDisposable} from "../../interfaces";
import {NumberUtils} from "../../utils";
import {ApplicationLoggerService} from "../logging";

export interface IProducerMessage {
  id: string;
  value: object;
}

export interface IBrokerOption {
  hosts: string;
  topic: {
    name: string;
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

  constructor(private logger: ApplicationLoggerService) {

  }

  connect(option: IBrokerOption): Promise<void> {
    this.option = option;

    this.client = new KafkaClient({
      autoConnect: false,
      connectRetryOptions: {
        retries: 3
      },
      connectTimeout: 2000
    });

    return new Promise<void>((resolve, reject) => {
      this.client.connect();
      this.client.on("close", () => {
        this.logger.info("close");
      });
      this.client.on("brokersChanged", () => {
        this.logger.info("brokersChanged");
      });
      this.client.on("ready", () => {
        this.logger.info("ready");

        this.producer = new Producer(this.client, {
          requireAcks: 1,
          ackTimeoutMs: 100
        });
        resolve();
      });
      this.client.on("zkReconnect", () => {
        this.logger.info("zkReconnect");
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
        this.logger.info("connect");
      });
    });
  }

  createTopic(topicName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.createTopics([
        {
          topic: topicName,
          partitions: 10,
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

  send(message: IProducerMessage): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const partition = NumberUtils.random(1, 10);
      this.producer.send([{
        topic: this.option.topic.name,
        partition: partition,
        messages: JSON.stringify(message)
      }], (error, data) => {
        if (error) {
          this.logger.error(error);
          return reject(error);
        }

        resolve(data);
      });
    });
  }

  dispose(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.client) {
        this.client.removeAllListeners();
        this.client.close(() => {
          resolve();
        });
      }
    });
  }
}
