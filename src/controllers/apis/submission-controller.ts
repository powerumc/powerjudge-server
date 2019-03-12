import {controller, httpPost, interfaces, request, response} from "inversify-express-utils";
import {ApplicationLoggerService, IApplicationLoggerService} from "src/services/logging";
import {Request, Response} from "express";

@controller("/api/v1/submission")
export class SubmissionController implements interfaces.Controller {

  constructor(@IApplicationLoggerService private logger: ApplicationLoggerService) {
  }

  @httpPost("/")
  eval(@request() req: Request, @response() res: Response) {
    return "ok";
  }

}
