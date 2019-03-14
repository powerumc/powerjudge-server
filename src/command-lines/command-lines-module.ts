import {Module} from "@nestjs/common";
import {PowerjudgeApiServer} from "@app";
import {RunAction} from "@app/command-lines";
import {ServicesModule} from "@app/services";

const services = [
  PowerjudgeApiServer,
  RunAction
];

@Module({
  providers: services,
  exports: services,
  imports: [ServicesModule]
})
export class CommandLinesModule { }
