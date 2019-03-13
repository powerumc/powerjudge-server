import {Injectable} from "@nestjs/common";
import {sync} from "command-exists";
import {ApplicationLoggerService} from "@app/services/logging";
import {DockerService} from "src/services/docker/docker-service";

@Injectable()
export class ApplicationBootstrapperService {

  constructor(private logger: ApplicationLoggerService,
              private docker: DockerService) {
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
