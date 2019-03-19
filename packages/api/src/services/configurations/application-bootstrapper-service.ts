import {Injectable} from "@nestjs/common";
import {sync} from "command-exists";
import {DockerService} from "../docker";
import {ApplicationLoggerService} from "powerjudge-common";

export interface IBootstrapperResult {
  result: boolean;
  detail: {
    docker: {
      installed: boolean;
      connectable: boolean;
    },
    broker: {
      connectable: boolean;
    }
  }
}

@Injectable()
export class ApplicationBootstrapperService {

  constructor(private logger: ApplicationLoggerService,
              private docker: DockerService) {
  }


  async check(): Promise<IBootstrapperResult> {
    let result: IBootstrapperResult = {
      result: false,
      detail: {
        docker: {
          installed: false,
          connectable: false
        },
        broker: {
          connectable: false
        }
      }
    };
    await this.checkDockerInstalled(result);
    await this.checkDockerConnect(result);

    result.result = result.detail.docker.installed && result.detail.docker.connectable;

    return result;
  }

  private async checkDockerInstalled(result: IBootstrapperResult): Promise<void> {
    result.detail.docker.installed = sync("docker");
  }

  private async checkDockerConnect(result: IBootstrapperResult): Promise<void> {
    try {
      if (await this.docker.info()) {
        result.detail.docker.connectable = true;
      }
    } catch (e) {
    }
  }
}
