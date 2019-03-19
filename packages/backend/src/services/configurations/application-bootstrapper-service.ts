import {Injectable} from "@nestjs/common";
import {DockerService} from "../docker";
import {ApplicationLoggerService} from "powerjudge-common";

export interface IBootstrapperResult {
  result: boolean;
  detail: {
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
        broker: {
          connectable: false
        }
      }
    };
    await this.checkBroker(result);

    result.result = result.detail.broker.connectable;

    return result;
  }

  private async checkBroker(result: IBootstrapperResult): Promise<void> {
  }
}
