import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationLoggerService} from "./logging";
import {BrokerService} from "./broker";

const services = [
  ApplicationService,
  ApplicationLoggerService,
  BrokerService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class CommonServicesModule { }
