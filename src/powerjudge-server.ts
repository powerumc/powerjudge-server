import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {Container, decorate, injectable} from "inversify";
import {IContainer, register} from "@app";
import {RunAction} from "@app/command-lines";

decorate(injectable(), CommandLineParser);

@register().isSingleton()
export class PowerJudgeServer extends CommandLineParser {

  constructor(@IContainer private container: Container) {
    super({
      toolFilename: "",
      toolDescription: "PowerJudge-Server"
    });

    this.addAction(container.get(RunAction));
  }

  protected onDefineParameters(): void {
  }

  protected onExecute(): Promise<void> {
    return super.onExecute();
  }
}
