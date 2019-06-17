import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {Injectable} from "@nestjs/common";

@Injectable()
export class PowerjudgeBackendServer extends CommandLineParser {

  constructor() {
    super({
      toolFilename: "",
      toolDescription: "powerjudge-backend-server"
    });
  }

  protected onDefineParameters(): void {
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}
