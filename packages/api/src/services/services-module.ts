import {Module} from "@nestjs/common";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {CommonServicesModule} from "powerjudge-common";

const services = [
  ApplicationConfigurationService,
  ApplicationBootstrapperService
];

@Module({
  imports: [CommonServicesModule],
  providers: [...services],
  exports: [...services]
})
export class ServicesModule { }
