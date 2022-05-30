const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chartSchema = new Schema({
  userEmail: String,
  keyword: String,
  savedDate: Date,
  analysisDate: Date,
  //analysisDate: String,
  chartImg: String,
  activity: String,
  option1: String,
  option2: String,
  option3: String,
  //jsonDocId: Number,
},{collection: 'myAnalysis'});

const conn = require("../connection/textMiningConn");
module.exports = conn.model("myAnalysis", chartSchema);
