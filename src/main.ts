import "./bootstrap";
import {NestFactory} from '@nestjs/core';
import {AppModule, PowerJudgeServer} from "@app";

(async () => {
  try {
    const nest = await NestFactory.create(AppModule);
    const server = nest.get(PowerJudgeServer);
    await server.execute(process.argv.slice(2));
  } catch(e) {
    console.error(e);
  }
})();
