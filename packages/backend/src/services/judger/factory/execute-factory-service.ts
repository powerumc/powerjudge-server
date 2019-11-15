import {ApplicationService} from "powerjudge-common";
import {DefaultExecuteStrategyService, InteractiveExecuteStrategyService, IExecuteStrategy} from "../strategy";
import {Injectable} from "@nestjs/common";

export interface IExecuteFactoryServiceOption {
  isInteractive: boolean;
}

@Injectable()
export class ExecuteFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(option?: IExecuteFactoryServiceOption): IExecuteStrategy {
    if (option && option.isInteractive) {
      return this.app.get(InteractiveExecuteStrategyService);
    }

    return this.app.get(DefaultExecuteStrategyService);
  }

}
