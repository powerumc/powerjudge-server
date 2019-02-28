import {CommandLineAction, CommandLineStringParameter} from "@microsoft/ts-command-line/lib";
import {Container} from "inversify";

export class RunAction extends CommandLineAction {

    private port: CommandLineStringParameter;

    constructor(private container: Container) {
        super({
            actionName: "run",
            documentation: "Run powerjudge-server.ts",
            summary: ""
        });
    }

    protected onDefineParameters(): void {
        this.port = this.defineStringParameter({
            parameterLongName: "--port",
            parameterShortName: "-p",
            description: "define port",
            defaultValue: "8080",
            argumentName: "PORT"
        });
    }

    protected onExecute(): Promise<void> {
        console.log(`Run judge-server.`);
        this.run();
        return Promise.resolve();
    }

    private run(): void {
    }

}