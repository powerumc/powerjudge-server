import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationLoggerService} from "./logging";
import {BrokerConsumerService, BrokerProducerService} from "./broker";

const services = [
  ApplicationService,
  ApplicationLoggerService,
  BrokerProducerService,
  BrokerConsumerService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class CommonServicesModule { }
