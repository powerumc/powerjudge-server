import {Module} from "@nestjs/common";
import {ApplicationService} from "@app/services/application";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "@app/services/configurations";
import {DockerService} from "@app/services/docker";
import {ApplicationLoggerService} from "@app/services/logging";

const services = [
  ApplicationService,
  ApplicationConfigurationService,
  ApplicationBootstrapperService,
  DockerService,
  ApplicationLoggerService
];

@Module({
  providers: services,
  exports: services
})
export class ServicesModule { }
