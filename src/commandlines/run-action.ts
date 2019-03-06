import {CommandLineAction, CommandLineStringParameter} from "@microsoft/ts-command-line/lib";
import {register} from "../decorators";
import {Container, decorate, inject, injectable} from "inversify";
import {IApplicationLogger} from "../services/logging/application-logger";

decorate(injectable(), CommandLineAction);

@register().isSingleton()
export class RunAction extends CommandLineAction {

    private port: CommandLineStringParameter;

    constructor(@inject('container') container: Container,
        @inject(IApplicationLogger) private logger: IApplicationLogger ) {
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

        this.logger.getInstance().info("Run judge-server.");

        this.run();
        return Promise.resolve();
    }

    private run(): void {
    }

}
