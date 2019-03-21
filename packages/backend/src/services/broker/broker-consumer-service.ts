import {Injectable} from "@nestjs/common";
import {Sema} from "async-sema";
import {ConsumerGroupStream, KafkaClient} from "kafka-node";
import {ApplicationLoggerService, IBrokerOption, IDisposable} from "powerjudge-common";

@Injectable()
export class BrokerConsumerService implements IDisposable {

  private option: IBrokerOption;
  private client: KafkaClient;
  private consumer: ConsumerGroupStream;
  private semaphore: Sema;

  constructor(private logger: ApplicationLoggerService) {
    this.semaphore = new Sema(1);
  }

  connect(option: IBrokerOption) {
    return new Promise<void>((resolve, reject) => {
      try {
        this.consumer = new ConsumerGroupStream({
          kafkaHost: option.hosts,
          autoCommit: true,
          encoding: "utf8",
          groupId: option.topic.name + "-group",
          maxTickMessages: 1,
          protocol: ["roundrobin"]
        }, option.topic.name);

        this.consumer.on("error", (error) => {
          this.logger.error(error);
        });
        this.consumer.on("close", () => {
          this.logger.info("close");
        });
        this.consumer.on("readable", () => {
          this.logger.info("readable");
        });
        this.consumer.on("end", () => {
          this.logger.info("end");
        });
        this.consumer.on("data", chunk => {
          this.logger.debug(`data=${JSON.stringify(chunk)}`);
        });

        this.client = this.consumer.client;
        this.option = option;

        resolve();
      } catch(e) {
        this.logger.error(e);
        reject(e);
      }
    });
  }

  dispose(): Promise<void> {
    return new Promise<void>(resolve => {
      this.client.removeAllListeners();
      this.consumer.close(() => {
        this.consumer.removeAllListeners();
        resolve();
      });
    });
  }

}
