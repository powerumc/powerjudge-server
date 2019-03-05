import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {RunAction} from "./commandlines/run-action";
import {register} from "./decorators";
import {Container, decorate, inject, injectable} from "inversify";

decorate(injectable(), CommandLineParser);

@register().isSingleton()
export class PowerJudgeServer extends CommandLineParser {

    constructor(@inject('container') private container: Container) {
        super({
           toolFilename: "",
           toolDescription: "PowerJudge-Server"
        });

        console.log("container="+container);
        this.addAction(container.get(RunAction));
    }

    protected onDefineParameters(): void {
    }

    protected onExecute(): Promise<void> {
        return super.onExecute();
    }
}