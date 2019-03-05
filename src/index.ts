import {PowerJudgeServer} from "./powerjudge-server";
import {container} from "./container";
import {Container} from "inversify";

container.bind<Container>('container').toConstantValue(container);

(async () => {
    try {
        const server = container.get(PowerJudgeServer);
        await server.execute(process.argv.slice(2));
    } catch(e) {
        console.error(e);
    }
})();