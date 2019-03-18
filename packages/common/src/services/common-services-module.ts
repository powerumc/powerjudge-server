import {Module} from "@nestjs/common";
import {ApplicationLoggerService} from "./logging";

const services = [
  ApplicationLoggerService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class CommonServicesModule { }
