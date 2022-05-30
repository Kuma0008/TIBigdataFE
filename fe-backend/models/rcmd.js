const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const rcmdSchema = new Schema({
  hashKey: String,
  rcmd: [],
  lastUpdate: Date,
});
const conn = require("../connection/dataConn");
module.exports = conn.model("rcmd", rcmdSchema);
