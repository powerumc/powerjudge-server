import {NestFactory} from '@nestjs/core';
import {AppModule} from "./app-module";
import {PowerjudgeApiServer} from "./command-lines";
import {ApplicationService} from "powerjudge-common";
import {RunAction} from "./command-lines/actions";
import {WsAdapter} from "@nestjs/platform-ws";

export async function runMain() {
  try {
    const nest = await NestFactory.create(AppModule, {logger: false});
    const app = nest.get(ApplicationService);
    app.init(nest);

    const server = app.get(PowerjudgeApiServer);
    server.addAction(app.get(RunAction));

    await server.execute(process.argv.slice(2));
  } catch(e) {
    console.error(e);
    process.exit(-1);
  }
}
