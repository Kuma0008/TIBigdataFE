const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const countChartSchema = new Schema({
  userEmail: String,
  keyword: String,
  savedDate: Date,
  analysisDate: Date,
  chartImg: String,
  activity: String,
  docId: Object
},{collection: 'tfidf'});

const conn = require("../../connection/textMiningConn");
module.exports = conn.model("tfidf", countChartSchema);