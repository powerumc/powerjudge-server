import {Module} from "@nestjs/common";
import {MongooseModule} from '@nestjs/mongoose';
import {CodesSchema} from "./mongoose-models";

const models = [
  MongooseModule.forFeature([{
    name: "Codes",
    schema: CodesSchema
  }])
];

@Module({
  imports: [...models],
  exports: [...models]
})
export class MongooseModelsModule { }
