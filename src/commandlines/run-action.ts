import config from '../../config.json';
import {CommandLineAction} from "@microsoft/ts-command-line/lib";

export class RunAction extends CommandLineAction {

    constructor() {
        super({
            actionName: "run",
            documentation: "Run powerjudge-server.ts",
            summary: ""
        });
    }

    protected onDefineParameters(): void {
    }

    protected onExecute(): Promise<void> {
        console.log(`Run judge-server.`);
        return Promise.resolve();
    }

}