import {Module} from "@nestjs/common";
import {PowerJudgeServer} from "@app";
import {ServicesModule} from "./services/services-module";

@Module({
  imports: [ServicesModule],
  controllers: [],
  providers: [PowerJudgeServer]
})
export class AppModule { }
