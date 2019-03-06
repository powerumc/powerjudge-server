import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {RunAction} from "./commandlines/run-action";
import {IContainer, register} from "./decorators";
import {Container, decorate, inject, injectable} from "inversify";

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