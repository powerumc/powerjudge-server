import {createDecorator, IContainer, register} from "src/decorators";
import {ApplicationLoggerService, IApplicationLoggerService} from "@app/services/logging";
import {InversifyExpressServer} from "inversify-express-utils";
import {Container} from "inversify";
import bodyParser = require("body-parser");
import {Application} from "express";
import "@app/controllers/apis";

@register().isSingleton()
export class ApplicationService {

  private server: InversifyExpressServer;
  private app: Application;

  constructor(@IContainer private container: Container,
              @IApplicationLoggerService private logger: ApplicationLoggerService) {

  }

  run(value: number | undefined) {
    this.server = new InversifyExpressServer(this.container);
    this.server.setConfig(app => {
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(bodyParser.json());
    });

    this.app = this.server.build();
    this.app.listen(value);
  }
}

export const IApplicationService = createDecorator(ApplicationService);
