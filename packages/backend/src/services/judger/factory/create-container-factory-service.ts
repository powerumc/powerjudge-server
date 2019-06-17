import {ApplicationService} from "powerjudge-common";
import {DefaultCreateContainerStrategyService, ICreateContainerStrategy} from "../strategy";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CreateContainerFactoryService {

  constructor(private app: ApplicationService) {

  }

  create(): ICreateContainerStrategy {
    return this.app.get(DefaultCreateContainerStrategyService);
  }
}
