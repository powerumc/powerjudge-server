import {Module} from "@nestjs/common";
import {PowerJudgeServer} from "@app";
import {ServicesModule} from "@app/services";

@Module({
  imports: [ServicesModule],
  exports: [ServicesModule],
  providers: [PowerJudgeServer]
})
export class AppModule { }
