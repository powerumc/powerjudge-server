import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {RunAction} from "./commandlines/run-action";
import {Container} from "inversify";

export class PowerJudgeServer extends CommandLineParser {

    constructor(container: Container) {
        super({
           toolFilename: "",
           toolDescription: "PowerJudge-Server"
        });

        this.addAction(new RunAction(container));
    }

    protected onDefineParameters(): void {
    }

    protected onExecute(): Promise<void> {
        return super.onExecute();
    }
}