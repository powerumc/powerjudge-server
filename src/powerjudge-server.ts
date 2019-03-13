import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {Inject, Injectable} from "@nestjs/common";
import {RunAction} from "@app/command-lines";
import {NestApplication} from "@nestjs/core";

@Injectable()
export class PowerJudgeServer extends CommandLineParser {

  constructor(private app: NestApplication) {
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
