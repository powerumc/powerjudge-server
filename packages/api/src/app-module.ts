import {Module} from "@nestjs/common";
import {ServicesModule} from "./services";
import {CommandLinesModule} from "./command-lines";
import {ControllersModule} from "./controllers";

@Module({
  imports: [
    ServicesModule,
    CommandLinesModule,
    ControllersModule
  ]
})
export class AppModule { }
