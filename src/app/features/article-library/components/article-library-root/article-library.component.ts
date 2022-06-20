import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AnalysisDatabaseService } from "src/app/core/services/analysis-database-service/analysis.database.service";
import { ElasticsearchService } from "src/app/core/services/elasticsearch-service/elasticsearch.service";
import { SearchMode } from "src/app/core/enums/search-mode";
import { ArticleService } from "src/app/core/services/article-service/article.service";
import {DictionaryOption} from '../../../../core/enums/dictionary-option';



@Component({
  selector: "app-category-library",
  templateUrl: "./article-library.component.html",
  styleUrls: ["./article-library.component.less"],
})
export class ArticleLibraryComponent implements OnInit {
  constructor(
    private analysisDatabaseService: AnalysisDatabaseService,
    private elasticsearchService: ElasticsearchService,
    private articleService: ArticleService,
    public _router: Router
  ) {
    this.elasticsearchService.setSearchMode(SearchMode.LIBRARY);
  }

  //new
  private _totalSavedDocsNum: number;
  private _selectedTp: string;
  private _selectedDict: string;
  private _selectedDoctype: string;

  private _toggleTopics: boolean[];
  private _institutionList: string[];
  private _selectedInst: string;
  private _all: string = "ALL"; //전체 선택했을 경우
  private _cat_choice_init = [this.all, this.all, this.all]; //주제, 사전편찬순, 기관순 3가지 종류
  private _cat_button_choice: string[] = this.cat_choice_init;
  private _categories: string[] = [
    "전체",
    "정치",
    "경제",
    "사회",
    "국제",
    "IT과학",
    "스포츠",
    "문화",
  ];
  private _dict_orders_1: string[] = [
    "전체",
    "가",
    "나",
    "다",
    "라",
    "마",
    "바",
    "사",
    "아",
    "자",
    "차",
    "카",
    "타",
    "파",
    "하"
  ];


  ngOnInit() {
    this.loadInstitutions();
  }

  selectedStyleObject(flag: boolean): Object {

    if (flag) {
      return {
        color: "white",
        "background-color": "#0FBAFF",
        border: "none",
      };
    } else {
      return {
        color: "black",
        "background-color": "white",
      };
    }
  }

  /**
   * @description Load institutions list
   */
  //new
  async loadInstitutions() {
    let res = await this.elasticsearchService.getInstitutions();
    let numRes = await this.elasticsearchService.countAllDocs();
    this.institutionList = res["aggregations"]["count"]["buckets"];
    this.totalSavedDocsNum = numRes["count"];
  }

  /**
   * @description Router to library/research-status
   */
  navToGraph(): void {
    this._router.navigateByUrl("library/research-status");
  }

  toggleTopic(i: number): void {
    this.toggleTopics[i] = !this.toggleTopics[i];
  }

  navToDetail(doc) {
    let id = doc["idList"];
    this.articleService.setSelectedHashKey(id);
    this._router.navigateByUrl("search/read");
  }

  /**
   * @description Select category of topic ot dictionary order or institution
   * @param $event
   * @param doc
   */
  async selectCategory($event, doc?) {
    this.articleService.clearList();

    let ct = $event.target.innerText;
    let id = $event.target.id;

    switch (id) {
      case "topic": {
        this.cat_button_choice[0] = ct;
        this.selectTopic(ct);
        break;
      }

      case "dict": {
        this.cat_button_choice[1] = ct;
        this.selectDictionary(ct);
        break;
      }

      case "inst": {
        this.cat_button_choice[2] = ct;
        this.selectInstitution(doc);
        break;
      }
    }
  }

  async search_category() {
    this.articleService.clearList();
    let category = this.get_chosen_category();
    let docs_id = await this.getDocIDsFromTopic(category); //현재 토픽에 해당하는 내용을 불러온다.
    docs_id.map((e) => this.articleService.addHashKey(e));
    this.elasticsearchService.setHashKeys(docs_id);
    this.elasticsearchService.multiHashKeySearchComplete();
  }

  /**
   * @description Select institutions and set search mode as selected
   * @param institution
   */
  async selectInstitution(institution: { key: string; doc_count: number }) {
    if (institution === null || this.selectedInst === institution.key) {
      this.selectedInst = "전체";
      this.elasticsearchService.setSelectedInst("");
    } else {
      this.selectedInst = institution.key;
      this.elasticsearchService.setSelectedInst(institution.key);
    }
    this.elasticsearchService.setSearchMode(SearchMode.LIBRARY);
    this.elasticsearchService.triggerSearch(1);
  }

  get_chosen_category() {
    return this.cat_button_choice[0];
  }

  /**
   * @description Return document ID from topic category
   * @param category
   */
  async getDocIDsFromTopic(category) {
    return (await this.analysisDatabaseService.getOneTopicDocs(category)) as [];
  }

  // getters and setters
  public setArrayValues(language): void {
    if (language === 'ko') {
      this.categories.splice(
        0,
        this.categories.length,
        "전체",
        "정치",
        "경제",
        "사회",
        "국제",
        "IT_과학",
        "스포츠",
        "문화");
    }
    else {
      this.categories.splice(
        0,
        this.categories.length,
        "Total",
        "Politics",
        "Economics",
        "Social",
        "International",
        "IT_Science",
        "Sports",
        "Culture"
      );
    }
  }
  public get toggleTopics(): boolean[] {
    return this._toggleTopics;
  }
  public set toggleTopics(value: boolean[]) {
    this._toggleTopics = value;
  }
  public get institutionList(): string[] {
    return this._institutionList;
  }
  public set institutionList(value: string[]) {
    this._institutionList = value;
  }
  public get selectedInst(): string {
    return this._selectedInst;
  }
  public set selectedInst(value: string) {
    this._selectedInst = value;
  }
  public get all(): string {
    return this._all;
  }
  public set all(value: string) {
    this._all = value;
  }
  public get cat_choice_init() {
    return this._cat_choice_init;
  }
  public set cat_choice_init(value) {
    this._cat_choice_init = value;
  }
  public get cat_button_choice(): string[] {
    return this._cat_button_choice;
  }
  public set cat_button_choice(value: string[]) {
    this._cat_button_choice = value;
  }
  public get categories(): string[] {
    return this._categories;
  }
  public set categories(value: string[]) {
    this._categories = value;
  }
  public get dict_orders_1(): string[] {
    return this._dict_orders_1;
  }
  public set dict_orders_1(value: string[]) {
    this._dict_orders_1 = value;
  }

  //new
  public get totalSavedDocsNum(): number {
    return this._totalSavedDocsNum;
  }
  public set totalSavedDocsNum(value: number) {
    this._totalSavedDocsNum = value;
  }
  public get selectedTp(): string {
    return this._selectedTp;
  }
  public set selectedTp(value: string) {
    this._selectedTp = value;
  }

  public get selectedDict(): string {
    return this._selectedDict;
  }
  public set selectedDict(value: string) {
    this._selectedDict = value;
  }

  async selectDoc(e) {
    this.selectedDoctype = e.target.innerText.toString();

    if(this.selectedDoctype === "전체"){
      this.elasticsearchService.setDoctype("");
    } else {
      let doctype;
      switch (this.selectedDoctype){
        case '문서': {
          doctype = 'paper'
          break;
        }
        case '기사': {
          doctype = 'news'
          break;
        }
      }
      this.elasticsearchService.setDoctype(doctype);
    }
    this.elasticsearchService.setSearchMode(SearchMode.LIBRARY);
    this.elasticsearchService.triggerSearch(1);
  }

  public get selectedDoctype(): string {
    return this._selectedDoctype;
  }

  public set selectedDoctype(value: string) {
    this._selectedDoctype = value;
  }

  /**
   * @description Select institutions and set search mode as selected
   * @param institution
   */
  async selectTopic(tp: string) {
    this.selectedTp = tp;

    if(this.selectedTp === "전체"){
      this.elasticsearchService.setTopicHashKeys([]);
    }
    else {
      this.articleService.clearList();
      let hashKeys = await this.getDocIDsFromTopic(this.selectedTp);
      let ids: string[] = [];
      hashKeys.map((e) =>
        ids.push(e["hash_key"])
      );
      this.elasticsearchService.setTopicHashKeys(ids);
    }
    this.elasticsearchService.setSearchMode(SearchMode.LIBRARY);
    this.elasticsearchService.triggerSearch(1);
  }

  async selectDictionary(dict: string) {
    this.selectedDict = dict;

    if(this.selectedDict === "전체"){
      this.elasticsearchService.setFirstChar("");
    } else {
      this.elasticsearchService.setFirstChar(DictionaryOption[this.selectedDict]);
    }
    this.elasticsearchService.setSearchMode(SearchMode.LIBRARY);
    this.elasticsearchService.triggerSearch(1);
  }
}
