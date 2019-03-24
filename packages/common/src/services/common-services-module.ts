import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationLoggerService} from "./logging";
import {BrokerProducerService} from "./broker";
import {RedisService} from "./redis";
import {MongoService} from "./mongo";

const services = [
  ApplicationService,
  ApplicationLoggerService,
  BrokerProducerService,
  RedisService,
  MongoService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class CommonServicesModule { }
