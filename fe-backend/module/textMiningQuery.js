const express = require("express");
const moment = require("moment");
const Res = require("../models/Res");
const router = express.Router();

router.post("/uploadDict", uploadDict);
router.post("/findDict", findDict);

router.post("/getPreprocessedData",getPreprocessedData);
router.post("/uploadChart", uploadChart);
router.post("/getCharts", getCharts);
router.post("/deleteCharts", deleteCharts);
router.post("/getChartData",getChartData);

const usersDict = require("../models/usersDict");
const preprocessing = require("../models/preprocessing");
const myAnalysis = require("../models/myAnalysis");

const count = require("../models/activity/count");
const tfidf = require("../models/activity/tfidf");
const kmeans = require("../models/activity/kmeans");
const hcluster = require("../models/activity/hcluster");
const ngrams = require("../models/activity/ngrams");
const network = require("../models/activity/network");
const word2vec = require("../models/activity/word2vec");
const topicLDA = require("../models/activity/topicLDA");


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

async function findDict(req, res){
  usersDict.findOne(
    { $and : [{ userEmail : req.body.userEmail }]}
  ).then((result) => {
    if(result) {
      return res
        .status(200)
        .json(
          new Res(true, "successfully found", result)
        );
    }else{
      return res
        .status(200)
        .json(
          new Res(true, "no saved dict", null)
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


  async function getPreprocessedData(req, res) {
    let userEmail = req.body.userEmail;
    let savedDate = req.body.savedDate;
    
    preprocessing
      .findOne(
        { $and : [ { 'userEmail' : userEmail }, { 'savedDate' : savedDate }] }
      )
      .limit(1)
      .sort({ $natural: -1})
      .then((result) => {
        //for(let i=0;i<result.tokenList.length;i++)
          //result.tokenList[i] = result.tokenList[i].slice(0,10);
        if (result)
          return res
            .status(200)
            .json(
              new Res(true, "successfully loaded preprocessed data", result)
            );
        else{
          return res
          .status(400)
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
      
    /*
    preprocessing
      .findOne(
        { $and: [ { 'userEmail': userEmail }, {'savedDate' : new Date(savedDate).toISOString() } ] },
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
    */
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
    //   'option1': req.body.option1,
    //   'option2': req.body.option2,
    //   'option3': req.body.option3,
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
    { $and : [{ userEmail : req.body.userEmail, keyword : req.body.keyword, savedDate : req.body.savedDate}]})
    .then((result) => {
    if(result){
      return res
        .status(200)
        .json(
          new Res(true, "successfully loaded", result)
        );
    }else{
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

async function deleteCharts(req, res){
  myAnalysis.deleteOne(
    { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate } ]},
    { upsert: true, returnNewDocument: true }
  ).then((result) => {
    if(result){
      return res
        .status(200)
        .json(
          new Res(true, "successfully deleted", result)
        );
    }else{
      return res
        .status(400)
        .json(
          new Res(false, "not found", null)
        );
    }
  }).catch((err) => {
    console.log(err);
    return res
      .status(400)
      .json(
        new Res(false, "failed", null)
      )
  });
}

async function getChartData(req, res){
  if(req.body.activity === 'tfidf'){
    tfidf.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 
    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "count"){
    count.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "kmeans"){
    kmeans.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "network"){
    network.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "ngrams"){
    ngrams.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "hcluster"){
    hcluster.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "word2vec"){
    word2vec.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }else if(req.body.activity === "topicLDA"){
    topicLDA.findOne(
      { $and: [{ userEmail: req.body.userEmail }, { analysisDate: req.body.analysisDate}] } 

    ).then((result) => {
      if(result){
        return res
          .status(200)
          .json(
            new Res(true, "succeed", result)
          );
      }else{
        return res
          .status(400)
          .json(
            new Res(false, "no data", null)
          );
      }
    }).catch((err) => {
      console.log(err);
      return res
        .status(400)
        .json(
          new Res(false, "failed", null)
        )
    });
  }
}


module.exports = router;