import * as npath from "path";
import * as Dockerode from "dockerode";
import {ICreateContainerStrategy} from "./interfaces";
import {ICompilerMappingItem} from "../compile-mapping-service";
import {ApplicationLoggerService} from "powerjudge-common";
import {ApplicationConfigurationService} from "../../configurations";
import {DockerService} from "../../docker";
import {Injectable} from "@nestjs/common";

@Injectable()
export class DefaultCreateContainerStrategyService implements ICreateContainerStrategy {

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService,
              private docker: DockerService) {

  }

  async createContainer(message, mapping: ICompilerMappingItem): Promise<Dockerode.Container> {
    const path = npath.resolve(this.config.getPrivilegeRoot(message));
    const container = await this.docker.create(message.id, mapping.image, path, "/pj");
    await this.docker.start(container);

    return container;
  }

}
