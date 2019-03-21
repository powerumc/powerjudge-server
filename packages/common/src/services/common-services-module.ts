import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationLoggerService} from "./logging";
import {BrokerProducerService} from "./broker";

const services = [
  ApplicationService,
  ApplicationLoggerService,
  BrokerProducerService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class CommonServicesModule { }
