import {Module} from "@nestjs/common";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {DockerService} from "./docker";
import {CommonServicesModule} from "powerjudge-common";
import {BrokerConsumerService} from "./broker";
import {JudgeService} from "./judger";

const services = [
  ApplicationConfigurationService,
  ApplicationBootstrapperService,
  DockerService,
  BrokerConsumerService,
  JudgeService
];

@Module({
  imports: [CommonServicesModule],
  providers: [...services],
  exports: [...services]
})
export class ServicesModule { }
