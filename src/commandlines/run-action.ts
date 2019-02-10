import config from '../../config.json';
import {CommandLineAction} from "@microsoft/ts-command-line/lib";

export class RunAction extends CommandLineAction {

    constructor() {
        super({
            actionName: "run",
            documentation: "Run powerjudge-server",
            summary: ""
        });
    }

    protected onDefineParameters(): void {
    }

    protected onExecute(): Promise<void> {
        console.log(`Run judge-server '${config.name}'`);
        return Promise.resolve();
    }

}