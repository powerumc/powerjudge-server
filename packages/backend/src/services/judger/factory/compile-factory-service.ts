import {ApplicationService} from "powerjudge-common";
import {DefaultCompileStrategyService, ICompileStrategy} from "../strategy";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CompileFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(): ICompileStrategy {
    return this.app.get(DefaultCompileStrategyService);
  }
}
