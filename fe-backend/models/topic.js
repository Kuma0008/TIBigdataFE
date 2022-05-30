const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const topicSchema = new Schema({
  topic: String,
  hash_key: String,
  doc_title: String,
});

const conn = require("../connection/dataConn");
module.exports = conn.model("topics", topicSchema);
