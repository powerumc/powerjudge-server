import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {Injectable} from "@nestjs/common";

@Injectable()
export class PowerJudgeServer extends CommandLineParser {

  constructor() {
    super({
      toolFilename: "",
      toolDescription: "PowerJudge-Server"
    });
  }

  protected onDefineParameters(): void {
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}
