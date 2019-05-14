import {Module} from "@nestjs/common";
import {CodeGateway} from "./websockets/code-gateway";
import {ServicesModule} from "../services";

const controllers = [
  CodeGateway
];

@Module({
  imports: [ServicesModule],
  providers: [...controllers]
})
export class WebsocketControllersModule { }
