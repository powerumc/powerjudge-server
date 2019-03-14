import {Module} from "@nestjs/common";
import {ServicesModule} from "@app/services";
import {CommandLinesModule} from "@app/command-lines";
import {ControllersModule} from "src/controllers";

@Module({
  imports: [
    ServicesModule,
    CommandLinesModule,
    ControllersModule
  ]
})
export class AppModule { }
