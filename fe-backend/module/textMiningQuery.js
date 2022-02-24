const express = require("express");
const moment = require("moment");
const Res = require("../models/Res");
const router = express.Router();

router.post("/uploadDict", uploadDict);
router.post("/getPreprocessedData",getPreprocessedData);
router.post("/uploadChart", uploadChart);

//확인...
//router.post("/getChartNum",getChartNum);
router.post("/getCharts", getCharts);

const usersDict = require("../models/usersDict");
const preprocessing = require("../models/preprocessing");
const myAnalysis = require("../models/myAnalysis");
const { resourceLimits } = require("worker_threads");

async function uploadDict(req, res) {
    let userEmail = req.body.userEmail;
    let dictType = req.body.dictType;
    let csv = req.body.csv;

    // console.log('req',req);
    let doc;
    if(dictType=='synonym') doc = {'synonym':csv};
    else if(dictType=='stopword') doc = {'stopword':csv};
    else if(dictType=='compound') doc = {'compound':csv};

    usersDict.findOneAndUpdate(
        { userEmail: userEmail },
        {"$set":doc},
        { upsert: true, returnNewDocument: true }
      ).then((result=>console.log(result)));
          return res
            .status(200)
            .json(
              new Res(true, "successfully uploaded",null)
            );
  }


  async function getPreprocessedData(req, res) {
    let userEmail = req.body.userEmail;
    let savedDate = req.body.savedDate;
  
    preprocessing
      .findOne(
        { $and: [ { userEmail: userEmail }, {'savedDate' : new Date(savedDate).toISOString() } ] },
        // sort=[('processedDate', 1)]
        )
      .then((result) => {
        // console.log(result);
        // for(let i=0;i<result.tokenList.length;i++)
        // // let i=0;
        //   result.tokenList[i] = result.tokenList[i].slice(0,10);
        result.tokenList = result.tokenList[0].slice(0,10);
        if (result)
          return res
            .status(200)
            .json(
              new Res(true, "successfully saved doc HashKeys", result)
            );
        else{
          return res
          .status(200)
          .json(
            new Res(false, "no saved docs", [])
          );
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json(new Res(false, "successfully saved doc HashKeys", null));
      });
  }

  async function uploadChart(req, res) {
    if(req.body.userEmail == null  || req.body.chartImg == null) 
    return res.status(400).json(
      new Res(false, "Request body does not exist",null)
    );
  
    // console.log('req',req);
    // let doc = {
    //   'userEmail': req.body.userEmail,
    //   'keyword': req.body.keyword,
    //   'savedDate': req.body.savedDate,
    //   'analysisDate': req.body.savedDate,
    //   'chartImg': req.body.chartImg,
    //   'activity': req.body.activity,
    //   'jsonDocId': req.body.jsonDocId,
    // };
    let doc=req.body;

    myAnalysis.findOneAndUpdate(
      { $and: [{ userEmail: req.body.userEmail },{ analysisDate: req.body.analysisDate},]},
        {"$set":doc},
        { upsert: true, returnNewDocument: true }
      ).then((result)=>{
          console.log("successfully uploaded");
          return res
            .status(200)
            .json(
              new Res(true, "successfully uploaded",null)
            );
      }).catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json(
            new Res(false, "Upload to mongo DB Failed",null)
          );;
      });
  }

async function getCharts(req, res) {
  myAnalysis.find(
    { $and : [{ userEmail : req.body.userEmail, keyword : req.body.keyword }]})
    .then((result) => {
    if(result){
      console.log("successfully loaded");
      return res
        .status(200)
        .json(
          new Res(true, "successfully loaded", result)
        );
    }else{
      console.log("no saved chart");
      return res 
        .status(400)
        .json(
          new Res(false, "no saved chart",null)
        );
    }
  }).catch((err) => {
    console.log(err);
    return res
      .status(400)
      .json(
        new Res(false, "loading failed", null)
      )
  });
}
module.exports = router;