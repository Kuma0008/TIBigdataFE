const express = require("express");
const router = express.Router();
const Keywords = require("../models/rcmd");
const Res = require("../models/Res");

const IS_TEST = false;

router.get("/", (req, res) => {
  res.send("rcmdQuery");
});

router.get("/test", (req, res) => {
  console.log("work!");
  let id = "5de1134ab53863d63aa55309";
  Keywords.findOne({ docID: id }, (error, val) => {
    if (error) {
      console.log(error);
    }
    // console.log(val)
    res.json(val);
  });
});

router.post("/getRcmdTbl", getRcmdTbl);

/**
 * @description 문서의 id (혹은 id list) 을 전달 받으면 그 문서들의 연관 문서들을 문서 id 형태로 반환해준다.
 */
function getRcmdTbl(req, res) {
  let ids = req.body["hashKey"];

  // console.log("post getRcmdTbl")
  console.log(ids);
  // console.log(typeof(ids))
  //연관문서의 수를 몇개까지 반환해줄지 결정한다. 전달받은게 없으면 default으로 5개 반환한다.
  let num = req.body["num"]; //could be undefined if does not request specific num.
  if (num == undefined) num = 5;
  // else {
  //   num = parseInt(num);
  //   num++; //자기 자신 지워야 한다. 코사인 유사도는 자기 자신에 대해서 가장 높은 값.
  // }
  //연관문서 결과를 반환할 때 연관된 정도의 수치도 함께 반환할지 결정
  let isSim = req.body["sim"];
  let matchQuery = undefined;

  if (typeof ids == "string")
    //only send one string
    matchQuery = { hashKey: ids };
  //when send string array
  else matchQuery = { hashKey: { $in: ids } };

  // console.log("right b4 equey")
  console.log(matchQuery);

  Keywords.aggregate(
    [
      {
        $match: matchQuery,
      },
      {
        $project: {
          hashKey: 1,
          rcmd: { $slice: ["$rcmd", num] },
        },
      },
      {
        $unwind: "$rcmd",
      },
      {
        $project: {
          hashKey: 1,
          rcmd: {
            $filter: {
              input: "$rcmd",
              cond: {
                $ne: [{ $arrayElemAt: ["$rcmd", 0] }, ids],
              },
            },
          },
        },
      },
      {
        $project: {
          hashKey: 1,
          rcmd: {
            $cond: {
              if: isSim,
              then: "$rcmd",
              else: { $arrayElemAt: ["$rcmd", 0] },
            },
          },
        },
      },
      {
        $group: {
          _id: "$docID",
          rcmd: { $push: "$rcmd" },
          // rcmd: { $addToSet: "$rcmd" } -> cannot make a array with order
        },
      },
    ],
    (err, docs) => {
      if (err) console.error(err);
      console.log("result : ");
      console.log(docs);
      res.json(new Res(true, "response of get rcmd table ", docs));
    }
  );
}

if (IS_TEST) module.exports = { getRcmdTbl };
else module.exports = router;
