import {Module} from "@nestjs/common";
import {PowerJudgeServer} from "@app";
import {RunAction} from "@app/command-lines";
import {ServicesModule} from "@app/services";

const services = [
  PowerJudgeServer,
  RunAction
];

@Module({
  providers: services,
  exports: services,
  imports: [ServicesModule]
})
export class CommandLinesModule { }
