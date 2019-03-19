import {Module} from "@nestjs/common";
import {ApplicationLoggerService} from "./logging";
import {BrokerService} from "./broker";

const services = [
  ApplicationLoggerService,
  BrokerService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class CommonServicesModule { }
