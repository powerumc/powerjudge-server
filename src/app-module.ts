import {Module} from "@nestjs/common";
import {ServicesModule} from "@app/services";
import {CommandLinesModule} from "@app/command-lines";

@Module({
  imports: [
    ServicesModule,
    CommandLinesModule
  ]
})
export class AppModule { }
