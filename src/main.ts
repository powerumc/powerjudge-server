import "./bootstrap";
import {PowerJudgeServer} from "@app";
import {container} from "@app";
import {Container} from "inversify";

container.bind(Container).toConstantValue(container);

(async () => {
  try {
    const server = container.get(PowerJudgeServer);
    await server.execute(process.argv.slice(2));
  } catch (e) {
    console.error(e);
  }
})();
