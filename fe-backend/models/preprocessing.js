const { stringify } = require("@angular/compiler/src/util");
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const autoIncrement = require("mongoose-auto-increment");
const conn = require("../connection/textMiningConn");

autoIncrement.initialize(conn);

const preprocessingModel = new Schema({
  userEmail: String,
  keyword: String,
  savedDate: String,
  processedData: Date,
  nTokens: Number,
  //tokenList: [[String]],
  tokenList : Array,
  titleList: [String],
},{collection: 'preprocessing'});

module.exports = conn.model("preprocessing", preprocessingModel);
