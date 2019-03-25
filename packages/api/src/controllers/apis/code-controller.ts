import {Body, Controller, Post} from "@nestjs/common";
import {ApplicationLoggerService, MongoService, IFilesRequest, CodesModel} from "powerjudge-common";
import {Guid} from "guid-typescript";

@Controller("/api/code")
export class CodeController {

  constructor(private logger: ApplicationLoggerService,
              private mongo: MongoService) {

  }

  @Post("run")
  async run(@Body() request: IFilesRequest) {
    try {
      this.logger.debug(request);

      let model = new CodesModel({
        uid: Guid.create().toString(),
        language: request.language,
        files: request.files
      });
      await model.save();

      return "ok";
    } catch(e) {
      this.logger.error(e);
    }
  }

}
