import {Module} from "@nestjs/common";
import {PowerjudgeApiServer} from "./powerjudge-api-server";
import {RunAction} from "./actions/run-action";
import {ServicesModule} from "../services";

const services = [
  PowerjudgeApiServer,
  RunAction
];

@Module({
  providers: [...services],
  exports: [...services],
  imports: [ServicesModule]
})
export class CommandLinesModule { }
