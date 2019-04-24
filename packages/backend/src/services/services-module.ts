import {Module} from "@nestjs/common";
import {ApplicationBootstrapperService, ApplicationConfigurationService} from "./configurations";
import {DockerService} from "./docker";
import {CommonServicesModule} from "powerjudge-common";
import {BrokerConsumerService} from "./broker";
import {
  CompileFactoryService,
  CompileMappingService,
  CompileService,
  CreateContainerFactoryService,
  DefaultCompileStrategyService,
  DefaultCreateContainerStrategyService,
  DefaultExecuteStrategyService,
  ExecuteFactoryService,
  JudgeService
} from "./judger";

const services = [
  ApplicationConfigurationService,
  ApplicationBootstrapperService,
  DockerService,
  BrokerConsumerService,
  JudgeService,
  CompileService,
  CompileMappingService,
  CreateContainerFactoryService,
  CompileFactoryService,
  ExecuteFactoryService,
  DefaultCreateContainerStrategyService,
  DefaultCompileStrategyService,
  DefaultExecuteStrategyService
];

@Module({
  imports: [CommonServicesModule],
  providers: [...services],
  exports: [...services]
})
export class ServicesModule { }
