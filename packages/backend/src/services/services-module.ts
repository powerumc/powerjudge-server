import {Module} from "@nestjs/common";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {DockerService} from "./docker";
import {CommonServicesModule} from "powerjudge-common";
import {BrokerConsumerService} from "./broker";

const services = [
  ApplicationConfigurationService,
  ApplicationBootstrapperService,
  DockerService,
  BrokerConsumerService
];

@Module({
  imports: [CommonServicesModule],
  providers: [...services],
  exports: [...services]
})
export class ServicesModule { }
