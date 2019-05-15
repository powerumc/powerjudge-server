import {Module} from "@nestjs/common";
import {CodeGateway} from "./websockets/code-gateway";
import {ServicesModule} from "../services";

const gateways = [
  CodeGateway
];

@Module({
  imports: [ServicesModule],
  providers: [...gateways]
})
export class WebsocketControllersModule { }
