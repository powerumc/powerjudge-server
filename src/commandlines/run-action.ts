import {CommandLineAction, CommandLineStringParameter} from "@microsoft/ts-command-line/lib";
import {IContainer, register} from "../decorators";
import {Container, decorate, injectable} from "inversify";
import {ApplicationConfiguration, IApplicationConfiguration} from "@services/configurations";
import {ApplicationLogger, IApplicationLogger} from "@services/logging";

decorate(injectable(), CommandLineAction);

@register().isSingleton()
export class RunAction extends CommandLineAction {

    private port: CommandLineStringParameter;

    constructor(@IContainer container: Container,
                @IApplicationLogger private logger: ApplicationLogger,
                @IApplicationConfiguration private config: ApplicationConfiguration) {
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
            description: "Port number",
            defaultValue: "8080",
            argumentName: "PORT"
        });
    }

    protected onExecute(): Promise<void> {
        this.logger.getInstance().info(`Run ${this.config.config.name} ${this.config.version}.`);

        this.run();
        return Promise.resolve();
    }

    private run(): void {
    }

}
