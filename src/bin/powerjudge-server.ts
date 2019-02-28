#!/usr/bin/env node

import {PowerJudgeServer} from "../powerjudge-server";

(async () => {
    const server = new PowerJudgeServer();
    await server.execute(process.argv.splice(2));
})();
