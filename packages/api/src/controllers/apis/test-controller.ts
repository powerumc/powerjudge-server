import {Controller, Get} from "@nestjs/common";
import {ApplicationLoggerService} from "powerjudge-common";
import {ApplicationConfigurationService} from "../../services/configurations";
import {BrokerProducerService, NumberUtils} from "powerjudge-common";

@Controller("/api/test")
export class TestController {

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private producer: BrokerProducerService) {
  }

  @Get("send")
  async send() {
    const id = NumberUtils.random(1, 99999).toString();
    const value = "Hello World " + NumberUtils.random(1, 100);
    await this.producer.send({
      id
    });

    return `Send ${value}`;
  }

}
