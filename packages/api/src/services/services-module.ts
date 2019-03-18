import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {DockerService} from "./docker";
import {CommonServicesModule} from "powerjudge-common";

const services = [
  ApplicationService,
  ApplicationConfigurationService,
  ApplicationBootstrapperService,
  DockerService
];

@Module({
  imports: [CommonServicesModule],
  providers: [...services],
  exports: [...services]
})
export class ServicesModule { }
