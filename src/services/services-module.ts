import {Module} from "@nestjs/common";
import {ApplicationService} from "@app/services/application";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "@app/services/configurations";
import {DockerService} from "@app/services/docker";
import {ApplicationLoggerService} from "@app/services/logging";

@Module({
  providers: [
    ApplicationService,
    ApplicationConfigurationService,
    ApplicationBootstrapperService,
    DockerService,
    ApplicationLoggerService,
  ],
  exports: [
    ApplicationService,
    ApplicationConfigurationService,
    ApplicationBootstrapperService,
    DockerService,
    ApplicationLoggerService
  ]
})
export class ServicesModule {

}
