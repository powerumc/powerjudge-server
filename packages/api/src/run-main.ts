import {NestFactory} from '@nestjs/core';
import {AppModule, PowerjudgeApiServer} from "@app";
import {ApplicationService} from "@app/services/application";
import {RunAction} from "@app/command-lines";

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
