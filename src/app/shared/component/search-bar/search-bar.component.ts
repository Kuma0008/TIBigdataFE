import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {SearchMode} from 'src/app/core/enums/search-mode';
import {AnalysisDatabaseService} from 'src/app/core/services/analysis-database-service/analysis.database.service';
import {ArticleService} from 'src/app/core/services/article-service/article.service';
import {ElasticsearchService} from 'src/app/core/services/elasticsearch-service/elasticsearch.service';
import {TranslateService} from '@ngx-translate/core';
import {SortOption} from '../../../core/enums/serch-result-sort-option';

// import { SearchResultFilterComponent } from '../../../features/search-result/components/search-result-filter/search-result-filter.component';

@Component({
  selector: "app-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.less"],
})
export class SearchBarComponent implements OnInit {
  private _searchKeyword: string = "";
  private _selectedDate: string;
  private _isDateSelected: boolean = false;
  private _isInstSelected: boolean = false;
  private _isTopicSelected: boolean = false;
  private _selectedInst: string;
  private _selectedTopic: string;
  private _isMain: boolean = false;
  private _isSearching: boolean = false;
  private _isKeyLoaded: boolean;
  public relatedKeywords = [];
  public relatedKeywords_mobile = [];
  private searchStatusChange$: Observable<boolean> = this.elasticsearchService.getSearchStatus();
  private _institutionList: Array<Object>;
  private _startDate: string = "0001-01-01";
  private _endDate: string = "9000-12-31";

  private _dateList: Array<String> = [
    "1일",
    "1주일",
    "1개월",
    "3개월",
    "6개월",
    "1년",
  ];

  private _topicList: Array<String> = [
    "정치",
    "경제",
    "사회",
    "국제",
    "IT과학",
    "스포츠",
    "문화",
  ];


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

  constructor(
    public _router: Router,
    public translate: TranslateService,
    private elasticsearchService: ElasticsearchService,
    private articleService: ArticleService,
    private analysisDatabaseService: AnalysisDatabaseService,
  ) {
    this.searchStatusChange$.subscribe((status) => {
      if (status === true) this.setRelatedKeywords();
    });

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!this._router.url.includes("result")) {
          this.isKeyLoaded = false;
        }
      }
    });
  }

  ngOnInit() {
    this.selectedDate = "기간";
    this.selectedInst = "기관";
    this.selectedTopic = "주제별";
    this.isDateSelected = false;
    this.isInstSelected = false;
    this.isTopicSelected = false;
    this.isKeyLoaded = false;
    this.checkRouterIsMain();
    this.loadInstitutions();
  }

  async loadInstitutions() {
    let res = await this.elasticsearchService.getInstitutions();
    this.institutionList = res["aggregations"]["count"]["buckets"];
  }

  /**
   * @description Update filter value.
   * @param date User selected value from filter.
   */
  selectDate(selectDate: string): void {
    this.selectedDate = selectDate;
    this.isDateSelected = true;
    let startTime: Date;
    let endTime: Date;
    let date = new Date();

    switch (this.selectedDate) {
      case "1일": {
        endTime = new Date()
        startTime = new Date(date.setDate(date.getDate() - 1));

        this._startDate = toStringByFormatting(startTime);
        this._endDate = toStringByFormatting(endTime);
        break;
      }

      case "1주": {
        endTime = new Date()
        startTime = new Date(date.setDate(date.getDate() - 7));

        this._startDate = toStringByFormatting(startTime);
        this._endDate = toStringByFormatting(endTime);
        break;
      }

      case "1개월": {
        endTime = new Date()
        startTime = new Date(date.setMonth(date.getMonth() - 1));

        this._startDate = toStringByFormatting(startTime);
        this._endDate = toStringByFormatting(endTime);
        break;
      }

      case "3개월": {
        endTime = new Date()
        startTime = new Date(date.setMonth(date.getMonth() - 3));

        this._startDate = toStringByFormatting(startTime);
        this._endDate = toStringByFormatting(endTime);
        break;
      }

      case "6개월": {
        endTime = new Date()
        startTime = new Date(date.setMonth(date.getMonth() - 6));

        this._startDate = toStringByFormatting(startTime);
        this._endDate = toStringByFormatting(endTime);
        break;
      }

      case "1년": {
        endTime = new Date()
        startTime = new Date(date.setFullYear(date.getFullYear() - 1));

        this._startDate = toStringByFormatting(startTime);
        this._endDate = toStringByFormatting(endTime);
        break;
      }

      function toStringByFormatting(source, delimiter = '-') {
        const year = source.getFullYear();
        const month = leftPad(source.getMonth() + 1);
        const day = leftPad(source.getDate());
        return [year, month, day].join(delimiter);
      }

      function leftPad(value) {
        if (value >= 10) {
          return value;
        }
        return `0${value}`;
      }
    }
  }

  /**
   * @description Update filter value.
   * @param date User selected value from filter.
   */
  selectTopic(topic: string): void {
    this.selectedTopic = topic;
    this.isTopicSelected = true;
  }

  /**
   * @description Update filter value.
   * @param date User selected value from filter.
   */
  updateKeyword($event: { target: { value: string } }): void {
    this.searchKeyword = $event.target.value;
  }

  /**
   * @description Reset filter selection by reloading component.
   */
  resetFilters(): void {
    this._startDate = "0001-01-01";
    this._endDate = "9000-12-31";
    this.elasticsearchService.setSelectedDate(this._startDate, this._endDate);

    this.selectedInst = "";
    this.elasticsearchService.setSelectedInst(this.selectedInst);

    this.selectedTopic = "false";
    this.elasticsearchService.setTopicHashKeys([]);

    this.ngOnInit();
  }

  /**
   * @description set search configuration and navigate to search result page.
   */
  async search(): Promise<void> {

    if(this.isDateSelected == true)
      this.elasticsearchService.setSelectedDate(this._startDate, this._endDate);
    if(this.isInstSelected == true)
      this.elasticsearchService.setSelectedInst(this.selectedInst);
    if(this.isTopicSelected == true){
      this.articleService.clearList();
      let hashKeys = await this.getDocIDsFromTopic(this.selectedTopic);
      let ids: string[] = [];
      hashKeys.map((e) =>
        ids.push(e["hash_key"])
      );
      this.elasticsearchService.setTopicHashKeys(ids);
    }

    this.elasticsearchService.setSearchMode(SearchMode.KEYWORD);
    this.elasticsearchService.setSearchStatus(false);
    this.elasticsearchService.searchKeyword(this.searchKeyword);
    this.elasticsearchService.setCurrentSearchingPage(1);
    this._router.navigateByUrl("/search/result");
  }

  async getDocIDsFromTopic(category) {
    return (await this.analysisDatabaseService.getOneTopicDocs(category)) as [];
  }

  gotoMain(): void {
    this._router.navigateByUrl("");
  }

  /**
   * @description Check if current url is home
   */
  checkRouterIsMain(): void {
    let rootUrl = this._router.routerState.snapshot.url;

    if(rootUrl.startsWith("/library") || rootUrl.startsWith("/analysis") || rootUrl.startsWith("/community") || rootUrl.startsWith("/about") || rootUrl.startsWith("/userpage") || rootUrl.startsWith("/search")){
      this.isMain = false;
    } else {
      this.isMain = true;
    }
  }

  /**
   * @description Check if current url is search/result
   */
  checkSearchRoute(): void {
    if (this._router.routerState.snapshot.url === "search/result") {
      this.isKeyLoaded = true;
    } else {
      this.isKeyLoaded = false;
    }
  }

  /**
   * @description Trigger search with given keyword.
   * @param keyword Search keyword selected by user.
   */
  relatedSearch(keyword: string) {
    this.elasticsearchService.searchKeyword(keyword);
  }

  /**
   * @description Set related keywords for current search keyword.
   */
  async setRelatedKeywords(): Promise<void> {
    if (this._router.url.split("/")[2] !== "result") return;
    this.isKeyLoaded = false;
    this.relatedKeywords = [];
    this.relatedKeywords_mobile = [];
    await this.analysisDatabaseService
      .getCountVal(this.articleService.getList())
      .then((res) => {
        let data = res as [];
        for (let n = 0; n < data.length; n++) {
          let coVal = data[n]["count"];
          if (
            this.relatedKeywords.length < 6 &&
            coVal[0] !== this.searchKeyword &&
            !this.relatedKeywords.includes(coVal[0])
          )
            this.relatedKeywords.push(coVal[0]);
          /*mobile relatedKeywords_mobile*/
          if (
            this.relatedKeywords_mobile.length < 4 &&
            coVal[0] !== this.searchKeyword &&
            !this.relatedKeywords_mobile.includes(coVal[0])
          )
            this.relatedKeywords_mobile.push(coVal[0]);
        }
      });
    this.isKeyLoaded = true;
  }


  // getters and setters
  public get isDateSelected(): boolean {
    return this._isDateSelected;
  }
  public set isDateSelected(value: boolean) {
    this._isDateSelected = value;
  }
  public get isInstSelected(): boolean {
    return this._isInstSelected;
  }
  public set isInstSelected(value: boolean) {
    this._isInstSelected = value;
  }
  public get isTopicSelected(): boolean {
    return this._isTopicSelected;
  }
  public set isTopicSelected(value: boolean) {
    this._isTopicSelected = value;
  }
  public get selectedInst(): string {
    return this._selectedInst;
  }
  public set selectedInst(value: string) {
    this._selectedInst = value;
  }
  public get selectedTopic(): string {
    return this._selectedTopic;
  }
  public set selectedTopic(value: string) {
    this._selectedTopic = value;
  }
  public get isMain(): boolean {
    return this._isMain;
  }
  public set isMain(value: boolean) {
    this._isMain = value;
  }
  public get isSearching(): boolean {
    return this._isSearching;
  }
  public set isSearching(value: boolean) {
    this._isSearching = value;
  }
  public get isKeyLoaded(): boolean {
    return this._isKeyLoaded;
  }
  public set isKeyLoaded(value: boolean) {
    this._isKeyLoaded = value;
  }
  public get dateList(): Array<String> {
    return this._dateList;
  }
  public set dateList(value: Array<String>) {
    this._dateList = value;
  }
  public get selectedDate(): string {
    return this._selectedDate;
  }
  public set selectedDate(value: string) {

    this._selectedDate = value;
  }
  public get searchKeyword(): string {
    return this._searchKeyword;
  }
  public set searchKeyword(value: string) {
    this._searchKeyword = value;
  }
  public get topicList(): Array<String> {
    return this._topicList;
  }
  public set topicList(value: Array<String>) {
    this._topicList = value;
  }

  public get institutionList(): Array<Object> {
    return this._institutionList;
  }

  public set institutionList(value: Array<Object>) {
    this._institutionList = value;
  }

  selectInst(inst: { key: string; doc_num: number }) {
    this.selectedInst = inst.key;
    this.isInstSelected = true;
  }

}
