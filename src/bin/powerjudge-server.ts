#!/usr/bin/env node

import {PowerJudgeServer} from "../powerjudge-server";
import {Container} from "inversify";

(async () => {
    const container = new Container();
    const server = new PowerJudgeServer(container);
    await server.execute(process.argv.splice(2));
})();
