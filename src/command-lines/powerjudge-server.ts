import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {Injectable} from "@nestjs/common";
import {RunAction} from "@app/command-lines";
import {ApplicationService} from "@app/services/application";

@Injectable()
export class PowerJudgeServer extends CommandLineParser {

  constructor(private app: ApplicationService) {
    super({
      toolFilename: "",
      toolDescription: "PowerJudge-Server"
    });

    this.addAction(app.get(RunAction));
  }

  protected onDefineParameters(): void {
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}
