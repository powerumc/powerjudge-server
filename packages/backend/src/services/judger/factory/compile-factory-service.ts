import {ApplicationService} from "powerjudge-common";
import {DefaultCompileStrategyService, ICompileStrategy} from "../strategy";

export class CompileFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(): ICompileStrategy {
    return this.app.get(DefaultCompileStrategyService);
  }
}
