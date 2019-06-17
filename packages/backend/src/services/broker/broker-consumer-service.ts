import {Injectable} from "@nestjs/common";
import * as fs from "fs";
import {Sema} from "async-sema";
import {ConsumerGroup, KafkaClient} from "kafka-node";
import {ApplicationLoggerService, IBrokerOption, IDisposable, FsUtils} from "powerjudge-common";
import {JudgeService} from "../judger";

@Injectable()
export class BrokerConsumerService implements IDisposable {

  private option: IBrokerOption;
  private client: KafkaClient;
  private consumer: ConsumerGroup;
  private semaphore: Sema;

  constructor(private logger: ApplicationLoggerService,
              private judge: JudgeService) {
    this.semaphore = new Sema(1);
  }

  connect(option: IBrokerOption) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.consumer = new ConsumerGroup({
          kafkaHost: option.hosts,
          connectOnReady: true,
          retries: 3,
          autoCommit: true,
          encoding: "utf8",
          groupId: option.topic.name + "-group",
          maxTickMessages: 1,
          protocol: ["roundrobin"]
        }, option.topic.name);

        this.consumer.on("error", error => {
          this.logger.error(error);
        });
        this.consumer.on("connect", () => {
          this.logger.info("broker connect");
          resolve();
        });
        this.consumer.on("rebalanced", () => {
          this.logger.info("broker rebalanced");
        });
        this.consumer.on("rebalancing", () => {
          this.logger.info("broker rebalancing");
        });
        this.consumer.on("offsetOutOfRange", error => {
          this.logger.error(error);
        });
        this.consumer.on("message", async message => {
          await this.onMessage(message);
        });

        this.client = this.consumer.client;
        this.option = option;

        await this.prepare(this.option.consumer.data.path);

        // this.consumer = new ConsumerGroupStream({
        //   kafkaHost: option.hosts,
        //   retries: 3,
        //   autoCommit: true,
        //   encoding: "utf8",
        //   groupId: option.topic.name + "-group",
        //   maxTickMessages: 1,
        //   protocol: ["roundrobin"]
        // }, option.topic.name);
        //
        // this.consumer.on("error", (error) => {
        //   this.logger.error(error);
        // });
        // this.consumer.on("close", () => {
        //   this.logger.info("broker close");
        // });
        // this.consumer.on("readable", () => {
        //   this.logger.info("broker readable");
        // });
        // this.consumer.on("end", () => {
        //   this.logger.info("broker end");
        // });
        // this.consumer.on("data", async (chunk) => {
        //   await this.onMessage(chunk);
        // });
        //
        // this.client = this.consumer.client;
        // this.option = option;
        //
        // await this.prepare(this.option.consumer.data.path);
        //
        // resolve();
      } catch(e) {
        this.logger.error(e);
        reject(e);
      }
    });
  }

  dispose(): Promise<void> {
    return new Promise<void>(async resolve => {
      if (this.client) {
        this.client.removeAllListeners();
      }

      resolve();
    });
  }

  close(): Promise<void> {
    return new Promise<void>(async resolve => {
      await this.dispose();
      this.consumer.close(() => {
        resolve();
      })
    });
  }

  private async prepare(path: fs.PathLike) {
    await FsUtils.mkdir(path);
  }

  private async onMessage(message: any) {
    if (message && message.value) {
      this.logger.info(`broker-consumer-service.onData: chunk=${JSON.stringify(message)}`);
      await this.judge.process(JSON.parse(message.value));
    }
  }

}
