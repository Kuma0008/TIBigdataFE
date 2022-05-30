import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { ElasticsearchService } from "src/app/core/services/elasticsearch-service/elasticsearch.service";
import * as d3 from 'd3';
import { Tooltip } from "chart.js";

@Component({
  selector: 'app-keyword-analysis',
  templateUrl: './keyword-analysis.component.html',
  styleUrls: ['./keyword-analysis.component.less']
})
export class KeywordAnalysisComponent implements OnInit, OnDestroy {
  private searchHistory = [];
  private searchSubscriber: Subscription;
  private searchKeyword: string;
  private currentYearMonth: string;
  private startYearMonth: string;
  private endYearMonth: string;
  private per: string;

  //related to drawing chart
  // set the dimensions and margins of the graph
  private margin;
  private width;
  private height;
  // append the svg object to the body of the page
  private svg;
  // Initialize the X axis
  private x;
  private xAxis;
  // Initialize the Y axis
  private y;
  private yAxis;

  constructor(private elasticsearchService: ElasticsearchService) {
    this.searchSubscriber = this.elasticsearchService
                                .getSearchStatus()
                                .subscribe(() => {
                                  this.setSearchKeyword();
                                });
  }

  ngOnInit(): void {
    this.setSearchKeyword();
    this.setMinMaxDate();
    this.initFigure();
    this.month_clicked();
  }

  ngOnDestroy() {
    this.searchSubscriber.unsubscribe();
  }

  setSearchKeyword() {
    this.searchKeyword = this.elasticsearchService.getKeyword();
  }

  setMinMaxDate(){
    var current = new Date();
    var year = current.getFullYear();
    var c_month = current.getMonth() + 1;
    if(c_month < 10) {
      this.currentYearMonth = "" + year + "-0" +  c_month;
    }
    else {
      this.currentYearMonth = "" + year + "-" +  c_month;
    }
  }

  year_clicked() {
    var yb = document.getElementById("year_button");
    var mb = document.getElementById("month_button");
    yb.style.background="lightgrey";
    mb.style.background="transparent";

    this.startYearMonth = (<HTMLInputElement>document.getElementById("start_month")).value;
    this.endYearMonth = (<HTMLInputElement>document.getElementById("end_month")).value;
    this.per = "year";
  }

  month_clicked() {
    var yb = document.getElementById("year_button");
    var mb = document.getElementById("month_button");
    mb.style.background="lightgrey";
    yb.style.background="transparent";

    this.startYearMonth = (<HTMLInputElement>document.getElementById("start_month")).value;
    this.endYearMonth = (<HTMLInputElement>document.getElementById("end_month")).value;
    this.per = "month";
  }

  getYearData(data){
    var yearData = [];
    var tmpYear = "-1";
    var tmpIdx = 0;
    for(var i = 0; i < data.length; i ++){
      var year = data[i]["date"].split("\.")[0];
      if(tmpYear == "-1"){
        yearData.push({date: year, freq: data[i]["freq"]});
        tmpYear = year;
      }
      else if(tmpYear == year){
        yearData[tmpIdx]["freq"] = yearData[tmpIdx]["freq"] + data[i]["freq"];
      }
      else {
        yearData.push({date: year, freq: data[i]["freq"]});
        tmpIdx++;
        tmpYear = year;
      }
    }
    console.log(yearData)
    return yearData;
  }

  async updateChart(){
    this.startYearMonth = (<HTMLInputElement>document.getElementById("start_month")).value;
    this.endYearMonth = (<HTMLInputElement>document.getElementById("end_month")).value;

//     var dataPerYear = await this.updateData(this.startYearMonth, this.endYearMonth);
    var dataPerMonth = await this.updateData(this.startYearMonth, this.endYearMonth);
    // console.log(dataPerMonth);
//     var jan = {date: "2022.01", freq: 18};
//     var feb = {date: "2022.02", freq: 30};
//     var mar = {date: "2022.03", freq: 55};
//
//     var data1 = [jan];
//     var data2 = [feb];
//     var data3 = [mar];
//     var data12 = [jan, feb];
//     var data13 = [jan, feb, mar];
//     var data23 = [feb, mar];

    var x = this.x;
    var xAxis = this.xAxis;
    var y = this.y;
    var yAxis = this.yAxis;
    var svg = this.svg;
    var height = this.height;
    var width = this.width;

    function update(data) {
      // Update the X axis
      x.domain(data.map(d => d["date"]))
      xAxis.call(d3.axisBottom(x))
      // Update the Y axis
      y.domain([0, d3.max(data, function(d) { return d["freq"]; }) ] as number[]);
      yAxis.transition().duration(1000).call(d3.axisLeft(y).ticks(5));
      // Create the u variable
      var u = svg.selectAll("rect")
                 .data(data);
      u.join("rect") // Add a new rect for each new elements
       .transition()
       .duration(1000)
       .attr("x", d => x(d["date"]))
       .attr("y", d => y(d["freq"]))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d["freq"]))
       .attr("fill", "#38bdff");
    }

    //For test
    if(this.per == "month"){
      update(dataPerMonth);
//       if(this.startYearMonth == "2022-01" && this.endYearMonth == "2022-01"){
//         update(dataPerMonth);
//       }
//       else if(this.startYearMonth == "2022-01" && this.endYearMonth == "2022-02"){
//         update(data12);
//       }
//       else if(this.startYearMonth == "2022-02" && this.endYearMonth == "2022-02"){
//         update(data2);
//       }
//       else if(this.startYearMonth == "2022-01" && this.endYearMonth == "2022-03"){
//         update(data13);
//       }
//       else if(this.startYearMonth == "2022-02" && this.endYearMonth == "2022-03"){
//         update(data23);
//       }
//       else if(this.startYearMonth == "2022-03" && this.endYearMonth == "2022-03"){
//         update(data3);
//       }
    } else{
        var year_data = await this.getYearData(dataPerMonth);
        update(year_data)
    }
  }

  initFigure() {
    //related to drawing chart
    // set the dimensions and margins of the graph
    this.margin = {top: 30, right: 30, bottom: 30, left: 60};
    this.width = 460 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    // append the svg object to the body of the page
    this.svg = d3.select("#keyword_analysis")
                 .append("svg")
                 .attr("width", this.width + this.margin.left + this.margin.right)
                 .attr("height", this.height + this.margin.top + this.margin.bottom)
                 .append("g")
                 .attr("transform",
                       "translate(" + this.margin.left + "," + this.margin.top + ")");
    // Initialize the X axis
    this.x = d3.scaleBand()
               .range([ 0, this.width ])
               .padding(0.4);
    this.xAxis = this.svg.append("g")
                         .attr("transform", "translate(0," + this.height + ")");

    // Initialize the Y axis
    this.y = d3.scaleLinear()
               .range([ this.height, 0]);
    this.yAxis = this.svg.append("g")
                         .attr("class", "myYaxis");
    this.updateChart();
  }

  async updateData(start, end) {
    var searchHistory = [];
    var month = [3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7];
    var cnt = [];
    var s_idx = -1;
    var e_idx = -1;
    for(var i = 5 ; i < 17; i++){
      if(month[i] == +start.split("-")[1]) {
        s_idx = i;
      }
      if(month[i] == +end.split("-")[1]) {
        e_idx = i;
      }
    }
    if(s_idx == -1 || e_idx == -1){
      console.log("IDX_ERROR");
    }
    for(var i = s_idx; i <= e_idx; i ++){
      var m;
      var y = start.split("-")[0];

      if(month[i] < 10){
        m = "0" + month[i];
      }
      else {
        m = "" + month[i];
      }
      //search_log-<year>.<month>
      var index = "search_log-" + y + "." + m;
      var count;
      try {
        count = await this.elasticsearchService.getSearchHistory(index);
        const hist = {date: "" + y + "." + m, freq: count["count"]};
        searchHistory.push(hist);
      }
      catch (e) {
        console.log("There is no log file for year: " + y + ", month: " + m);
        const hist = {date: "" + y + "." + m, freq: 0};
        searchHistory.push(hist);
      }

      if(month[i] > month[i - 1]){
              y = +y;
              y = y + 1;
      }
    }
    console.log("search history");
    return searchHistory;
  }

  public get getSearchKeyword(): string {
    return this.searchKeyword;
  }

  public get getCurrentYearMonth(): string {
      return this.currentYearMonth;
  }
}


