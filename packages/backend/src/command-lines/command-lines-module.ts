import {Module} from "@nestjs/common";
import {PowerjudgeBackendServer} from "./powerjudge-backend-server";
import {RunAction} from "./actions/run-action";
import {ServicesModule} from "../services";

const services = [
  PowerjudgeBackendServer,
  RunAction
];

@Module({
  providers: [...services],
  exports: [...services],
  imports: [ServicesModule]
})
export class CommandLinesModule { }
