const express = require("express");
const router = express.Router();
const topic = require("../models/topic");
const Res = require("../models/Res");

router.get("/", (req, res) => {
  res.send("topicQuery");
});

router.post("/getTopicCounts", (req, res) => {
  topic
    .aggregate([{ $group: { _id: "$topic", count: { $sum: 1 } } }])
    .then((result) => {
      return res
        .status(200)
        .json(new Res(true, "successfully get topic counts", result));
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(new Res(false, "failed to get topic counts", null));
    });
});

router.get("/getTopicTblPlain", (req, res) => {
  topic.find({}, (err, docs) => {
    if (err) console.log(err);
    console.log(docs);
    res.json(docs);
  });
});

router.post("/getOneTopicDocs", (req, res) => {
  console.log("get reqeust");
  let tp = req.body.topic;
  console.log(tp);
  topic.aggregate(
    [
      {
        $match: { topic: tp },
      },
      {
        $project: {
          hash_key: 1,
          _id : 0,
        },
      },
    ],
    (err, docs) => {
      if (err) console.log(err);
      else {
        res.json(docs);
      }
    }
  );
});

router.post("/getTopicTbl", (req, res) => {
  let topicReq = req.body["topic"];
  topic.aggregate([
    { $match: { topic: topicReq } },
  ]);
});

module.exports = router;
