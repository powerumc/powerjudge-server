import {Module} from "@nestjs/common";
import {ApplicationService} from "./application";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {DockerService} from "./docker";
import {ApplicationLoggerService} from "./logging";

@Module({
  providers: [
    ApplicationService,
    ApplicationConfigurationService,
    ApplicationBootstrapperService,
    DockerService,
    ApplicationLoggerService
  ],
  exports: [
    ApplicationService,
    ApplicationConfigurationService,
    ApplicationBootstrapperService,
    DockerService,
    ApplicationLoggerService
  ]
})
export class ServicesModule { }
