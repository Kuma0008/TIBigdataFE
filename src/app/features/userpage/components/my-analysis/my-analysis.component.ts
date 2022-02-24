import { Component, OnInit, Input, Inject } from '@angular/core';
import { UserProfile } from 'src/app/core/models/user.model';
import { AnalysisOnMiddlewareService } from "src/app/core/services/analysis-on-middleware-service/analysis.on.middleware.service";
import { AuthenticationService } from 'src/app/core/services/authentication-service/authentication.service';
import { UserSavedDocumentService } from 'src/app/core/services/user-saved-document-service/user-saved-document.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { AnalysisComponent } from 'src/app/features/article-analysis/components/analysis/analysis.component'

@Component({
  selector: 'app-my-analysis',
  templateUrl: './my-analysis.component.html',
  styleUrls: ['./my-analysis.component.less']
})

export class MyAnalysisComponent /*extends AnalysisComponent*/ implements OnInit {
  
  private _charts : any;
  private _userProfile :UserProfile

  private _savedKeywords : Array<{ keyword: string, savedDate: string; }>;
  private _isSavedKeywordsEmpty : boolean;
  private _isSavedKeywordsLoaded : boolean;
  private _isSavedChartsEmpty : boolean;
  private _isSavedChartsLoaded : boolean;
  private _keyword : string;
  private _savedDate : string;
  private _detail : string;
  private _chartNum : number;


  private _form : FormGroup;
  
  constructor(
    private middlewareService : AnalysisOnMiddlewareService,
    private authService : AuthenticationService,
    private userSavedDoc : UserSavedDocumentService
  ){
    this.userProfile = this.authService.getCurrentUser()
  }
  ngOnInit(): void {
    this.loadSavedKeywords()
    this.form = new FormGroup({
      checkArray : new FormArray([]),
      detail : new FormGroup({})
    });
  }

  async loadSavedKeywords() : Promise<void>{
    console.log("loading keywords");
    this.isSavedKeywordsEmpty = true;
    this.isSavedKeywordsLoaded = false;
    this.savedKeywords = await this.userSavedDoc.getMyKeywords();
    if(this.savedKeywords.length === 0){ 
      this.isSavedKeywordsEmpty = true;
      //console.log("No keywords saved");
    }else{
      this.isSavedKeywordsEmpty = false;
      this.isSavedKeywordsLoaded = true;
      console.log(this.savedKeywords);
    }
    this.getAllCharts(this.savedKeywords[0].keyword);
  }

  async getAllCharts(selectedKeyword : string) : Promise<void> {
    this.isSavedChartsEmpty = true;
    this.isSavedChartsLoaded = false;
    //console.log(this.userProfile.email);
    let data = JSON.stringify({
      'userEmail': this.userProfile.email,
      'keyword' : selectedKeyword
    });
    this.charts = await this.middlewareService.postDataToFEDB('/textMining/getCharts',data);
    //console.log("저장된 문서 개수: ",this.charts.length)
    
    if(this.charts.length === 0){
      this.isSavedChartsEmpty = true;
      //console.log("no saved charts in ",selectedKeyword);
    }else{
      this.isSavedChartsEmpty = false;
      this.isSavedChartsLoaded = true;
    }
  }

  currentKeywordAndDate(selectedKeyword: string, savedDate: string){
    this.keyword = selectedKeyword;
    this.savedDate = savedDate;
    this.getAllCharts(this.keyword);
  }

  async showDetail(chart : any) : Promise<void>{
    window.open("popup.html","차트", "width = 500, height = 500, top = 100, left = 200, location = no");
  }

  // MyAnalysis 컬렉션에서 차트 삭제 
  async deleteMyAnalysis(chart: any) : Promise<void>{
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

  public get detail(): string {
    return this._detail;
  }
  public set detail(value: string) {
    this._detail = value;
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

  public get chartNum() : number {
    return this._chartNum;
  }
  public set chartNum(value: number) {
    this._chartNum = value;
  } 
}