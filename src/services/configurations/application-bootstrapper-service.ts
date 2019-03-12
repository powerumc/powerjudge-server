import {createDecorator, register} from "@app";
import {ApplicationLoggerService, IApplicationLoggerService} from "@app/services/logging";
import {sync} from "command-exists";
import {DockerService, IDockerService} from "src/services/docker/docker-service";

@register().inTransient()
export class ApplicationBootstrapperService {

  constructor(@IApplicationLoggerService private logger: ApplicationLoggerService,
              @IDockerService private docker: DockerService) {
  }


  async checkAsync(): Promise<boolean> {
    this.logger.info("Detecting requirement.");

    let result = true;
    result = result && await this.checkDockerInstalledAsync();
    result = result && await this.checkDockerConnectAsync();

    return result;
  }

  private async checkDockerInstalledAsync(): Promise<boolean> {
    this.logger.info("\t- Checking Docker");

    const result = sync("docker");
    result && this.logger.info("\t\t- Installed Docker.");
    !result && this.logger.error("\t\t- Docker is not installed.");

    return result;
  }

  private async checkDockerConnectAsync(): Promise<boolean> {
    let result = false;
    try {
      if (await this.docker.infoAsync()) {
        result = true;
      }
      this.logger.info("\t\t- Connected Docker.");
    } catch (e) {
      this.logger.error("\t\t- " + e);
    }

    return result;
  }
}

export const IApplicationBootstrapperService = createDecorator(ApplicationBootstrapperService);
