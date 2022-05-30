// @ts-nocheck

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";
import { Color, Label, SingleDataSet } from "ng2-charts";
import * as d3 from 'd3';
import { QueryResponse } from "src/app/core/models/query.response.model";
import { IpService } from "src/app/core/services/ip-service/ip.service";

@Component({
  selector: "app-research-status",
  templateUrl: "./research-status.component.html",
  styleUrls: ["./research-status.component.less"],
})
export class ResearchStatusComponent implements OnInit {
  constructor(private httpClient: HttpClient,
    private ipsService: IpService) { }
  public chartOptions: ChartOptions = {
    responsive: true,
  };
  public chartLabels: Label[] = [["SciFi"], ["Drama"], "Comedy"];
  public chartData: SingleDataSet = [30, 50, 20];
  public chartType: ChartType = "pie";
  public chartLegend = false;
  public chartPlugins = [];
  private _chartConfig: ChartConfiguration;
  private _API_URL: string = this.ipsService.getFrontDBServerIp();
  private _GET_TOPIC_URL: string = this.API_URL + "/topic/getTopicCounts";
  private _isChartLoaded = false;

  async ngOnInit(): Promise<void> {
    await this.getTopicCounts();
    this.drawChart();
  }

  drawChart(){
    // set the dimensions and margins of the graph
    const width = 450,
        height = 450,
        margin = 10;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'my_dataviz'
    const svg = d3.select("#pie_chart")
      .classed("chart-wrapper", true)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 450 450")
      .classed("svg-content-responsive", true)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    // add circle in the middle of the doughnut graph
    svg.append("svg:circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius * 0.38)
        .style("fill", "#158cc4")
        .append("g");

    svg.append("text")
       .text("통일연구동향")
       .attr("x", -45)
       .attr("y", 8)
       .style("fill", "white")
       .style("font-size", "19px");

    var label = this.chartLabels;
    var value = this.chartData;

    var d = {};
//     const returnedTarget = Object.assign(target, source);
    for(var i = 0; i < label.length; i ++){
        d = Object.assign(d, {[label[i]]: value[i]});
    }
    const data = d;
    // set the color scale
    const color = d3.scaleOrdinal()
                .domain(label)
                .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    const pie = d3.pie()
      .sort(function (a, b) {
                      return b.count > (a.count);
                    })
      .value(d => d[1])
    const data_ready = pie(Object.entries(data))

    // The arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.4)         // This is the size of the donut hole
      .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
//     const outerArc = d3.arc()
//       .innerRadius(radius * 0.9)
//       .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('allSlices')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', "#38bdff")
//       #b8e6ff
//       .attr('fill', d => color(d.data[1]))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)

    // Add the polylines between chart and labels:
    svg
      .selectAll('allPolylines')
      .data(data_ready)
      .join('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
//         .attr('points', function(d) {
//           const posA = arc.centroid(d) // line insertion in the slice
//           const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
//           const posC = outerArc.centroid(d); // Label position = almost the same as posB
//           const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
//           posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
//           return [posA, posB]
//           return [posA, posB, posC]
//         })

    // Add the polylines between chart and labels:
    svg.selectAll('allLabels')
       .data(data_ready)
       .enter()
       .append('text')
       .text(d => d.data[0])
       .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")";  })
       .style("text-anchor", "middle")
       .style("font-size", 13)
       .style("fill", "white")

//     svg
//       .selectAll('allLabels')
//       .data(data_ready)
//       .join('text')
//         .text(d => d.data[0])
//         .attr('transform', function(d) {
//             const pos = outerArc.centroid(d);
//             const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
//             pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
//             return `translate(${pos})`;
//         })
//         .style('text-anchor', function(d) {
//             const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
//             return (midangle < Math.PI ? 'start' : 'end')
//         })
  }

  /**
   * @description Get topics to show with chart
   */
  async getTopicCounts() {
    await this.httpClient
      .post<any>(this.GET_TOPIC_URL, {})
      .toPromise()
      .then((result: QueryResponse) => {
        let items: Array<{ _id: string;
                           count: number;}> = result.payload as Array<any>;

        this.chartLabels = items.map((entry) => {
                              if (entry._id === "") entry._id = "기타";
                              return entry._id;
                            });

        let data = items.map((entry) => {
                              return entry.count;
                            });

        this.chartData = data;
      });
    this.isChartLoaded = true;
  }

  public get chartConfig(): ChartConfiguration {
    return this._chartConfig;
  }
  public set chartConfig(value: ChartConfiguration) {
    this._chartConfig = value;
  }
  public get API_URL(): string {
    return this._API_URL;
  }
  public set API_URL(value: string) {
    this._API_URL = value;
  }
  public get GET_TOPIC_URL(): string {
    return this._GET_TOPIC_URL;
  }
  public set GET_TOPIC_URL(value: string) {
    this._GET_TOPIC_URL = value;
  }
  public get isChartLoaded() {
    return this._isChartLoaded;
  }
  public set isChartLoaded(value) {
    this._isChartLoaded = value;
  }
}
