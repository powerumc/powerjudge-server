import {Module} from "@nestjs/common";
import {ServicesModule} from "./services";
import {CommandLinesModule} from "./command-lines";
import {ApiControllersModule, WebsocketControllersModule} from "./controllers";

@Module({
  imports: [
    ServicesModule,
    CommandLinesModule,
    ApiControllersModule,
    WebsocketControllersModule
  ]
})
export class AppModule { }
