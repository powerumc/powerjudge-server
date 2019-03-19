import {Controller, Get, Param} from "@nestjs/common";
import {ApplicationLoggerService} from "powerjudge-common";
import {ApplicationConfigurationService} from "../../services/configurations";
import {KafkaClient, Producer} from "kafka-node";

@Controller("/api/test")
export class TestController {

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService) {
  }

  @Get("create/:topicName")
  create(@Param() topicName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {

      const value = this.config.value.servers.broker;
      const client = new KafkaClient({
        kafkaHost: `${value.host}:${value.port}`,
        autoConnect: true
      });
      const producer = new Producer(client);
      producer.on("ready", () => {
        producer.createTopics([topicName], true, ((error, data) => {
          if (error) reject(error);

          console.log(data);
          client.close();
          resolve(data);
        }));
      });
      producer.on("error", error => {
        reject(error);
      })
    });
  }

}
