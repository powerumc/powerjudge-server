import "./bootstrap";
import {NestFactory} from '@nestjs/core';
import {AppModule, PowerJudgeServer} from "@app";
import {ApplicationService} from "@app/services/application";
import {RunAction} from "@app/command-lines";

export async function runMain() {
  try {
    const nest = await NestFactory.create(AppModule);
    const app = nest.get(ApplicationService);
    app.init(nest);

    const server = app.get(PowerJudgeServer);
    server.addAction(app.get(RunAction));
    await server.execute(process.argv.slice(2));
  } catch(e) {
    console.error(e);
  }
}

(async () => runMain())();
