import {CommandLineParser} from "@microsoft/ts-command-line/lib";
import {RunAction} from "./commandlines/run-action";

export class PowerJudgeServer extends CommandLineParser {

    constructor() {
        super({
           toolFilename: "",
           toolDescription: "PowerJudge-Server"
        });

        this.addAction(new RunAction());
    }

    protected onDefineParameters(): void {
    }

    protected onExecute(): Promise<void> {
        return super.onExecute();
    }
}