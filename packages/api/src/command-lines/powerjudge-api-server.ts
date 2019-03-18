import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {Injectable} from "@nestjs/common";

@Injectable()
export class PowerjudgeApiServer extends CommandLineParser {

  constructor() {
    super({
      toolFilename: "",
      toolDescription: "powerjudge-api-server"
    });
  }

  protected onDefineParameters(): void {
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}
