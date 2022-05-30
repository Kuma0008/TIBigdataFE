const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const countSchema = new Schema({
  hash_key: String,
  docTitle: String,
  count: [],
});

const conn = require("../connection/dataConn");
module.exports = conn.model("count", countSchema);
