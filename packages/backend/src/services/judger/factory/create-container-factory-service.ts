import {ApplicationService} from "powerjudge-common";
import {DefaultCreateContainerStrategyService, ICreateContainerStrategy} from "../strategy";

export class CreateContainerFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(): ICreateContainerStrategy {
    return this.app.get(DefaultCreateContainerStrategyService);
  }
}
