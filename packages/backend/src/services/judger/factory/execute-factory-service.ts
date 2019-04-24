import {ApplicationService} from "powerjudge-common";
import {DefaultExecuteStrategyService, IExecuteStrategy} from "../strategy";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ExecuteFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(): IExecuteStrategy {
    return this.app.get(DefaultExecuteStrategyService);
  }

}
