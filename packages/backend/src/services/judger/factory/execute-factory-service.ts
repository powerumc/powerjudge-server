import {ApplicationService} from "powerjudge-common";
import {DefaultExecuteStrategyService, IExecuteStrategy} from "../strategy";

export class ExecuteFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(): IExecuteStrategy {
    return this.app.get(DefaultExecuteStrategyService);
  }

}
