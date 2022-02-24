const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chartSchema = new Schema({
  userEmail: String,
  keyword: String,
  savedDate: Date,
  analysisDate: Date,
  chartImg: String,
  activity: String,
  jsonDocId: Number,
},{collection: 'myAnalysis'});

const conn = require("../connection/textMiningConn");
module.exports = conn.model("myAnalysis", chartSchema);
