import * as mongoose from "mongoose";

export const CodesSchema = new mongoose.Schema({
  uid: String,
  language: String,
  files: [Object]
});

export const CodesModel = mongoose.model("Codes", CodesSchema);
