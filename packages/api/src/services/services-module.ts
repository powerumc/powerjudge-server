import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {DockerService} from "./docker";
import {ApplicationLoggerService} from "./logging";

const services = [
  ApplicationService,
  ApplicationConfigurationService,
  ApplicationBootstrapperService,
  DockerService,
  ApplicationLoggerService
];

@Module({
  providers: [...services],
  exports: [...services]
})
export class ServicesModule { }
