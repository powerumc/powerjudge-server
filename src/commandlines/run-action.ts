import {CommandLineAction, CommandLineStringParameter} from "@microsoft/ts-command-line/lib";
import {IContainer, register} from "../decorators";
import {Container, decorate, inject, injectable} from "inversify";
import {ApplicationLogger, IApplicationLogger} from "../services/logging/application-logger";

decorate(injectable(), CommandLineAction);

@register().isSingleton()
export class RunAction extends CommandLineAction {

    private port: CommandLineStringParameter;

    constructor(@IContainer container: Container,
                @IApplicationLogger private logger: ApplicationLogger) {
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
        this.logger.getInstance().info("Run judge-server.");

        this.run();
        return Promise.resolve();
    }

    private run(): void {
    }

}
