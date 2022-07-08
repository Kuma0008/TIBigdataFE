const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const countChartSchema = new Schema({
  userEmail: String,
  keyword: String,
  savedDate: Date,
  analysisDate: Date
},{collection: 'network'});

const conn = require("../../connection/textMiningConn");
module.exports = conn.model("network", countChartSchema);