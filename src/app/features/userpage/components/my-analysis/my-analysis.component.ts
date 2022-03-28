import { Component, OnInit, Input, Inject } from '@angular/core';
import { UserProfile } from 'src/app/core/models/user.model';
import { AnalysisOnMiddlewareService } from "src/app/core/services/analysis-on-middleware-service/analysis.on.middleware.service";
import { AuthenticationService } from 'src/app/core/services/authentication-service/authentication.service';
import { UserSavedDocumentService } from 'src/app/core/services/user-saved-document-service/user-saved-document.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { AnalysisComponent } from 'src/app/features/article-analysis/components/analysis/analysis.component'
import { ModalService } from './modal/modal.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-my-analysis',
  templateUrl: './my-analysis.component.html',
  styleUrls: ['./my-analysis.component.less',], 
})

export class MyAnalysisComponent extends AnalysisComponent implements OnInit {

  private _userProfile :UserProfile
  private _charts : any;
  private _savedKeywords : Array<{ keyword: string, savedDate: string; }>;
  private _isSavedKeywordsEmpty : boolean;
  private _isSavedKeywordsLoaded : boolean;
  private _isSavedChartsEmpty : boolean;
  private _isSavedChartsLoaded : boolean;
  private _keyword : string;
  private _savedDate : string;

  chartData : any;

  private _form : FormGroup;

  private _option1 : boolean = false;
  private _option2 : boolean = false;
  private _option3 : boolean = false;
  
  
  constructor(
    _middlewareService : AnalysisOnMiddlewareService,
    _userSavedDocumentService : UserSavedDocumentService,
    private authService : AuthenticationService,
    private formBuilder : FormBuilder,
    private modalService : ModalService
  ){
    super(_middlewareService, _userSavedDocumentService); //Analysis Component로부터 상속
    this.userProfile = this.authService.getCurrentUser();
    this.form = this.formBuilder.group({
      checkArray : this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.loadSavedKeywords();
  }

  async loadSavedKeywords() : Promise<void>{
    this.isSavedKeywordsEmpty = true;
    this.isSavedKeywordsLoaded = false;
    this.savedKeywords = await this.userSavedDocumentService.getMyKeywords();
    if(this.savedKeywords.length === 0){ 
      this.isSavedKeywordsEmpty = true;
    }else{
      this.isSavedKeywordsEmpty = false;
      this.isSavedKeywordsLoaded = true;
      console.log(this.savedKeywords);
    }
    this.getCharts(this.savedKeywords[0].keyword, this.savedKeywords[0].savedDate);
    this.keyword = this.savedKeywords[0].keyword;
  }

  currentKeywordAndDate(selectedKeyword: string, savedDate: string){
    this.keyword = selectedKeyword;
    this.savedDate = savedDate;
    this.getCharts(this.keyword, this.savedDate);
  }

  /**
   * @description Load saved charts from myAnalysis
   */
  async getCharts(selectedKeyword : string, savedDate : string) : Promise<void> {
    this.isSavedChartsEmpty = true;
    this.isSavedChartsLoaded = false;
    let data = JSON.stringify({
      'userEmail': this.userProfile.email,
      'keyword' : selectedKeyword,
      'savedDate' : savedDate
    });
    this.charts = await this.middlewareService.postDataToFEDB('/textMining/getCharts',data);
  
    if(this.charts.length === 0){
      this.isSavedChartsEmpty = true;
    }else{
      this.isSavedChartsEmpty = false;
      this.isSavedChartsLoaded = true;
    }
    
    //checkbox 초기화
    for(let i in this.charts){
      this.charts[i]["isSelected"] = false;
    }
  }

  /**
   * @description Load a saved chart data from DB
   */
  async getChartData(chart: any) : Promise<any>{
    let parsedDate = this.parsingDate(chart.analysisDate);
    let data = JSON.stringify({
      'userEmail': chart.userEmail,
      'keyword': chart.keyword,
      'activity': chart.activity,
      'analysisDate' : parsedDate,
    });
         
    this.chartData = await this.middlewareService.postDataToFEDB('/textMining/getChartData', data);
    return this.chartData;
  }

  //show detail
  async openModal(chart: any){
    this.clearResult();
    this.chartData = await this.getChartData(chart);
    if(!this.chartData){
      alert("데이터 로딩 실패");
      return;
    }

    this.modalService.open('result');

   if(chart.activity == 'count'){
      this.drawTable('count', this.chartData.result_graph);
      this.drawBarChart(this.chartData.result_graph);
    } 
    else if(chart.activity == 'tfidf'){
      this.drawTable('tfidf', JSON.stringify(this.chartData.result_graph));
      this.drawBarChart(JSON.stringify(this.chartData.result_graph));
    }
    else if(chart.activity == 'network'){
      this.drawTable('network', JSON.stringify(this.chartData.resultCenJson));
      this.drawNetworkChart(JSON.stringify(this.chartData.resultGraphJson));
    }
    else if(chart.activity == 'ngrams'){
      this.drawNetworkChart(JSON.stringify(this.chartData.result));
    }
    else if(chart.activity == 'kmeans'){
      this.drawTable('kmeans',JSON.stringify(this.chartData.resultPCAList));
      this.drawScatterChart(JSON.stringify(this.chartData.resultPCAList));
    }
    else if(chart.activity == 'hcluster'){
      this.drawTreeChart(JSON.stringify(this.chartData.result));
    }
    else if(chart.activity == 'word2vec'){
    }
    else if(chart.activity == 'topicLDA'){
      this.drawTopicModeling(JSON.stringify(this.chartData.result_graph));
    }
  }

  closeModal(id: string){
    this.modalService.close(id);
  }


  //thumbnail info
  activityInfo(chart: any): String {
  if(chart.activity === 'count' ){ 
    this.option1 = true;
    this.option2 = false;
    this.option3 = false;
    return '빈도수분석'
  }
  else if( chart.activity === 'tfidf' ){ 
    this.option1 = true;
    this.option2 = false;
    this.option3 = false;
    return 'TFIDF'
  }
  else if( chart.activity === 'kmeans' ){ 
    this.option1 = true;
    this.option2 = false;
    this.option3 = false;
    return '분할군집분석'
  }
  else if( chart.activity === 'network' ){ 
    this.option1 = true;
    this.option2 = true;
    this.option3 = false;
    return '의미연결망'
  }
  else if( chart.activity === 'hcluster' ){ 
    this.option1 = false;
    this.option2 = false;
    this.option3 = false;
    return '계층군집분석'
  }
  else if( chart.activity === 'ngrams' ){ 
    this.option1 = true;
    this.option2 = true;
    this.option3 = true;
    return 'N-gram'
  }
  else if( chart.activity === 'word2vec' ){ 
    this.option1 = true;
    this.option2 = false;
    this.option3 = false;
    return '유의어분석'
  }
  else if( chart.activity === 'topicLDA' ){ 
    this.option1 = true;
    this.option2 = false;
    this.option3 = false;
    return '토픽모델링'
  }
  }

  option1Info(chart: any): String{
    if(chart.activity == 'count'){
      return '분석한 단어 수: ' + chart.option1;
    }
    else if(chart.activity == 'tfidf'){
      
      return '분석한 단어 수: ' + chart.option1;
    }
    else if(chart.activity == 'kmeans'){
      return '군집 개수: ' + chart.option1;
    }
    else if(chart.activity == 'network'){
      return '분석한 단어 수: ' + chart.option1;
    }
    else if(chart.activity == 'ngrams'){
      return '분석한 ngram 수: ' + chart.option1;
    }
    else if(chart.activity == 'word2vec'){
      return '분석한 단어 수: ' + chart.option1;
    }
    else if(chart.activity == 'topicLDA'){
      return '분석한 단어 수: ' + chart.option1;
    }
  }

  option2Info(chart: any): String{
    if(chart.activity == 'network'){
      return '연결 강도: ' + chart.option2;
    }
    else if(chart.activity == 'ngrams'){
      return '분석한 단어 수: ' + chart.option2;
    }
  }

  option3Info(chart: any): String{
    if(chart.activity == 'ngrams'){
      return '연결 강도: ' + chart.option3;
    }
  }

  clearResult(){
    d3.selectAll('figure > *').remove();
  }

  
  parsingDate(analysisDate: string){
    let date = new Date(analysisDate);
    let year = date.getFullYear();
    let result : string = year+"-";

    let month = date.getMonth()+1;
    if(month>9){
      result += month + "-";
    }else{
      result += "0" + month + "-";
    }

    let dt = date.getDate();
    if(dt>9){
      result += dt + " ";
    }else{
      result += "0" + dt + " ";
    }

    let hor = date.getHours();
    if(hor>9){
      result += hor + ":";
    }else{
      result += "0" + hor + ":";
    }

    let min = date.getMinutes();
    if(min>9){
      result += min + ":";
    }else{
      result += "0" + min + ":";
    }

    let sec = date.getSeconds();
    if(sec>9){
      result += sec + ".";
    }else{
      result += "0" + sec + ".";
    }

    let ms = date.getUTCMilliseconds();
    if(ms<10){
      result += "00" + ms + "Z";
    }else if(ms<100){
      result += "0"+ ms + "Z";
    }else{
      result += ms + "Z";
    }

    return result;
  }
  
  selectedNum : number = 0;
  async deleteSelectedCharts() : Promise<void>{
    if(this.form.value["checkArray"].length == 0){
      alert("삭제할 차트가 없습니다! 삭제할 차트를 선택해주세요.")
    }else{
      this.selectedNum = this.form.value["checkArray"].length - this.selectedNum;
      let deleteConfirm = confirm("총 " + this.selectedNum + "개를 삭제하시겠습니까? ")
      if(deleteConfirm){
        for(let i in this.form.value["checkArray"]){
          let data = JSON.stringify({
            'userEmail' : this.userProfile.email,
            'analysisDate': this.form.value["checkArray"][i]
          });
          await this.middlewareService.postDataToFEDB('/textMining/deleteCharts',data); 
        }
      }
    this.getCharts(this.keyword, this.savedDate);
    this.form.value["checkArray"].clear;
   }
  }

  async deleteAllCharts() : Promise<void>{
    let checkArray: FormArray = this.form.get("checkArray") as FormArray;
    this.checkUncheckAll(true,checkArray);
    this.deleteSelectedCharts();    
  }

  checkUncheckAll(isCheckAll: boolean, checkArray: FormArray): FormArray {
    if(isCheckAll){
      for(let i=0; i<this.charts.length; i++){
        checkArray.push(new FormControl(this.charts[i]["analysisDate"]))
      }
    }else{
      checkArray.clear();
    }

    for(let i=0; i<this.charts.length; i++){
      this.charts[i]["isSelected"] = isCheckAll;
    }
    return checkArray;
  }

  onCheckboxChange(e): void {
    let checkArray: FormArray = this.form.get("checkArray") as FormArray;
    if (e.target.value === "toggleAll") {
      checkArray = this.checkUncheckAll(e.target.checked, checkArray);
    } else {
      if (e.target.checked) {
        checkArray.push(new FormControl(e.target.value));  
      } else {
        let i: number = 0;
        checkArray.controls.forEach((item: FormControl) => {
          if (item.value == e.target.value) {
            checkArray.removeAt(i);
            console.log(checkArray);
            return;
          }
          i++;
        });
      }
    }
  }

  public get charts() : any{
    return this._charts;
  }
  public set charts(value : any){
    this._charts = value;
  }

  public get userProfile(): UserProfile {
    return this._userProfile;
  }
  public set userProfile(value: UserProfile) {
    this._userProfile = value;
  }

  public get form(): FormGroup {
    return this._form;
  }
  public set form(value: FormGroup) {
    this._form = value;
  }

  public get savedKeywords() : Array<{ keyword: string, savedDate: string; }>{
    return this._savedKeywords;
  }
  public set savedKeywords(value: Array<{ keyword: string, savedDate: string; }>){
    this._savedKeywords = value;
  }

  public get isSavedKeywordsEmpty(): boolean {
    return this._isSavedKeywordsEmpty;
  }
  public set isSavedKeywordsEmpty(value: boolean){
    this._isSavedKeywordsEmpty = value;
  }

  public get isSavedKeywordsLoaded(): boolean {
    return this._isSavedKeywordsLoaded;
  }
  public set isSavedKeywordsLoaded(value: boolean){
    this._isSavedKeywordsLoaded = value;
  }

  public get isSavedChartsEmpty(): boolean {
    return this._isSavedChartsEmpty;
  }
  public set isSavedChartsEmpty(value: boolean){
    this._isSavedChartsEmpty = value;
  }

  public get isSavedChartsLoaded(): boolean {
    return this._isSavedChartsLoaded;
  }
  public set isSavedChartsLoaded(value: boolean){
    this._isSavedChartsLoaded = value;
  }

  public get keyword() : string {
    return this._keyword;
  }
  public set keyword(value : string){
    this._keyword = value;
  }

  public get savedDate() : string {
    return this._savedDate;
  }
  public set savedDate(value: string) {
    this._savedDate = value;
  }

  public get option1(): boolean {
    return this._option1;
  }
  public set option1(value: boolean){
    this._option1 = value;
  }

  public get option2(): boolean {
    return this._option2;
  }
  public set option2(value: boolean){
    this._option2 = value;
  }

  public get option3(): boolean {
    return this._option3;
  }
  public set option3(value: boolean){
    this._option3 = value;
  }
}