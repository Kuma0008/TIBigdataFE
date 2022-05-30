import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {ArticleSource} from 'src/app/core/models/article.model';
import {PaginationModel} from 'src/app/core/models/pagination.model';
import {AnalysisDatabaseService} from 'src/app/core/services/analysis-database-service/analysis.database.service';
import {ArticleService} from 'src/app/core/services/article-service/article.service';
import {AuthenticationService} from 'src/app/core/services/authentication-service/authentication.service';
import {ElasticsearchService} from 'src/app/core/services/elasticsearch-service/elasticsearch.service';
import {PaginationService} from 'src/app/core/services/pagination-service/pagination.service';
import {UserSavedDocumentService} from 'src/app/core/services/user-saved-document-service/user-saved-document.service';
import {SearchMode} from '../../../core/enums/search-mode';
import {SortOption} from '../../../core/enums/serch-result-sort-option';

@Component({
  selector: "app-article-list",
  templateUrl: "./article-list.component.html",
  styleUrls: ["./article-list.component.less"],
})
export class ArticleListComponent implements OnInit, OnDestroy {
  public orders = ["정확도순", "최신순", "과거순"];
  public amounts = [10, 30, 50];
  private _form: FormGroup;

  private _relatedDocs: ArticleSource[][] = [];
  private _articleNumChange$: Observable<any> = this.elasticsearchService.getArticleNumChange();
  private _articleChange$: Observable<ArticleSource[]> = this.elasticsearchService.getArticleChange();
  private _searchStatusChange$: Observable<boolean> = this.elasticsearchService.getSearchStatus();

  private _articleNumSubscriber: Subscription;
  private _articleSubscriber: Subscription;
  private _articleSources: ArticleSource[];
  private _relatedDocBtnToggle: Array<boolean>;
  private _isResultFound: boolean;
  private _isSearchDone: boolean;
  private _isLoggedIn: boolean;
  private _isMainSearch: boolean;

  private _searchResultNum: string = "0";
  private _searchKeyword: string;
  private _currentPage: number = 1;
  private _pages: number[];
  private _startIndex: number;
  private _totalPages: number = 1;
  private _totalDocs: number;
  private _pageSize: number = 10;
  private _searchPaperResultNum: string = "0";
  private _searchNewsResultNum: string = "0";

  private _checkArray: FormArray = null;
  private _toggle_all : boolean = false;

  constructor(
    private userSavedDocumentService: UserSavedDocumentService,
    private articleService: ArticleService,
    private router: Router,
    private elasticsearchService: ElasticsearchService,
    private analysisDatabaseService: AnalysisDatabaseService,
    private formBuilder: FormBuilder,
    private paginationService: PaginationService,
    private authenticationService: AuthenticationService
  ) {
    this.setArticleForm();
    // Set articles when article has been changed
    this.articleSubscriber = this.articleChange$.subscribe((articles) => {
      this.articleSources = articles;
      this.resetSearchOptions();
      this.setArticleHashKeyList();
      this.setCheckbox();
      this.isResultFound = (articles !== null);
      this.elasticsearchService.setSearchStatus(true);
    });
    // Check if it is still searching
    this.searchStatusChange$.subscribe((status) => {
      this.isSearchDone = status;
    });

    // Set pagination and search result number when the number of articles has been changed
    this.articleNumSubscriber = this.articleNumChange$.subscribe((num) => {
      this.totalDocs = num;
      this.searchResultNum = this.convertNumberFormat(num);
      this.loadPage(this.elasticsearchService.getCurrentSearchingPage());
    });

    // Observe to check if user is signed out
    this.authenticationService.getCurrentUserChange().subscribe((user) => {
      this.isLoggedIn = user != null;
    });
  }

  ngOnDestroy() {
    this.articleSubscriber.unsubscribe();
    this.articleNumSubscriber.unsubscribe();
  }

  ngOnInit() {
    this.resetSearchOptions();
    this.beginSearch(this.currentPage);
  }

  /**
   * @description Set configurations of search and call search logic in elasticsearchService.
   * @param pageNum Number of articles to display in one page.
   */
  beginSearch(pageNum: number): void {
    this.currentPage = pageNum;
    if (this.currentPage === null) this.currentPage = 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    this.elasticsearchService.triggerSearch(this.currentPage);
  }

  /**
   * @description Create form to set checkbox for each article in the list.
   */
  setArticleForm(): void {
    this.form = this.formBuilder.group({
      checkArray: this.formBuilder.array([]),
    });
  }

  /**
   * @description Add property of checkbox value into article.
   */
  setCheckbox(): void {
    this.checkArray = this.form.get("checkArray") as FormArray;

    for (let i in this.articleSources) {
      this.articleSources[i]["isSelected"] = false;
      this.checkArray.controls.forEach((item: FormControl) => {
        if (item.value == this.articleSources[i]["_source"]["hash_key"]) {
          this.articleSources[i]["isSelected"] = true;
          return;
        }
      });
    }

    this.toggle_all = true;
    for (let i in this.articleSources) {
      if(this.articleSources[i]["isSelected"] == false){
        this.toggle_all = false;
      }
    }
  }

  /**
   * @description Update paging-related variable with given pagination model object.
   * @param pageInfo Pagination model object created by pagination service.
   */
  setPageInfo(pageInfo: PaginationModel): void {
    this.pages = pageInfo.pages;
    this.currentPage = pageInfo.currentPage;
    this.startIndex = pageInfo.startIndex;
    this.totalPages = pageInfo.totalPages;
  }

  /**
   * @description Update paging information based on current page information.
   * @param currentPage current page to display
   */
  async loadPage(currentPage: number): Promise<void> {
    let pageInfo: PaginationModel = await this.paginationService.paginate(
      currentPage,
      this.totalDocs,
      this.pageSize
    );
    this.setPageInfo(pageInfo);

    this.searchPaperResultNum = "0";
    this.searchNewsResultNum = "0";
    let res = this.elasticsearchService.getDoctypeWithTextSearch();
    res.then((count)=>{
      for(let name of count["aggregations"]["count"]["buckets"]){
        if(name.key === 'paper') {
          this.searchPaperResultNum = name.doc_count;
        }else if(name.key === 'news'){
          this.searchNewsResultNum = name.doc_count;
        }
      }
    })
  }

  /**
   * @description Convert number format by inserting ',' for each 3 digits. i.e. 1234567 will be converted into 1,234,567
   * @param num Number to convert.
   */
  convertNumberFormat(num: number): string {
    let docCount: string = num.toString();
    if (num === 0) return docCount;
    return docCount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * @description Reset all search options set before.
   */
  resetSearchOptions(): void {
    this.isMainSearch = (this.router.url === "/search/result");
    this.articleService.clearList();
    this.isResultFound = false;
    this.isSearchDone = false;
    this.currentPage = this.elasticsearchService.getCurrentSearchingPage();
    if (this.isMainSearch === true) {
      let previousSearchKeyword : string = this.searchKeyword;
      this.searchKeyword = this.elasticsearchService.getKeyword();
      if(previousSearchKeyword != this.searchKeyword){
        this.setArticleForm();
      }
    } else {
      this.searchKeyword = '키워드 없음';
    }
  }

  /**
   * @description Set list of article ids by reading id field of each element in articleSource.
   */
  setArticleHashKeyList(): void {
    this.relatedDocBtnToggle = [];
    for (var i in this.articleSources) {
      this.articleService.addHashKey(this.articleSources[i]["_source"]["hash_key"]);
      this.relatedDocBtnToggle.push(false);
    }
  }

  /**
   * @description Open selected related-article that user choose.
   * @param articleSourceIdx Index of article from articleSouce.
   * @param RelatedDocIdx Index of related articles from relatedDocs.
   */
  openSelectedDoc(articleSourceIdx: number, RelatedDocIdx: number): void {
    this.articleService.setSelectedHashKey(
      this.relatedDocs[articleSourceIdx][RelatedDocIdx]["id"]
    );
    this.navToDocDetail();
  }

  /**
   * @description Open list of related articles when user click on related article toggle.
   * @param i index of related articles.
   */
  openRelatedDocList(i: number): void {
    this.loadRelatedDocs(i);
    this.relatedDocBtnToggle[i] = !this.relatedDocBtnToggle[i];
  }

  /**
   * @description Load related articles of selected article.
   * @param idx Index number of article from relatedDocs.
   */
  loadRelatedDocs(hashKey: number): void {
    this.analysisDatabaseService
      .loadRelatedDocs(this.articleService.getHashKeyByIdx(hashKey))
      .then((res) => {
        this.relatedDocs[hashKey] = res as [];
      });
  }

  /**
   * @description Save checked articles into database.
   */
  saveSelectedDocs(): void {
    if (this.form.value["checkArray"].length == 0) {
      alert("담을 문서가 없습니다! 담을 문서를 선택해주세요.");
    } else {
      this.userSavedDocumentService
        .saveNewMyDoc(this.form.value["checkArray"], this._searchKeyword)
        .then(() => {
          alert("문서가 내 보관함에 저장되었어요.");
        });
      this.checkArray.clear();
    }
  }

  /**
   * @description Toggle check all checkbox.
   * @param isCheckAll If all checkboxes are currently checked, marked as true, otherwise, marked as false.
   * @param checkArray FormArray to update into checked all or unchecked all.
   */
  checkUncheckAll(isCheckAll: boolean, checkArray: FormArray): FormArray {
    if (isCheckAll) {
      this.toggle_all = true;
      for (let i = 0; i < this.articleSources.length; i++) {
        checkArray.push(new FormControl(this.articleSources[i]["_source"]["hash_key"]));
      }
    } else {
      this.toggle_all = false;

      let j : number = 0;
      this.checkArray.controls.forEach((item: FormControl, index :number) => {
        if (item.value == this.articleSources[0]["_source"]["hash_key"]) {
          for(let i = 10; i > 0; i--){
            this.checkArray.removeAt(j);
          }
          return;
        }
        j++;
      });
    }

    for (let i = 0; i < this.articleSources.length; i++) {
      this.articleSources[i]["isSelected"] = isCheckAll;
    }

    return checkArray;
  }

  /**
   * @description Listen to event in DOM and update value of each article's 'isSelected' field.
   * @param e DOM event.
   */
  onCheckboxChange(e): void {
    this.checkArray = this.form.get("checkArray") as FormArray;

    if (e.target.value === "toggleAll") {
      this.checkArray = this.checkUncheckAll(e.target.checked, this.checkArray);
    } else {
      if (e.target.checked) {
        this.checkArray.push(new FormControl(e.target.value));
      } else {
        let i: number = 0;
        this.checkArray.controls.forEach((item: FormControl) => {
          if (item.value == e.target.value) {
            this.checkArray.removeAt(i);
            return;
          }
          i++;
        });
      }
    }
  }

  /**
   * @description Set selected article and navigate to article detail.
   * @param docHashKey
   */
  openDocDetail(docHashKey: string): void {
    this.articleService.setSelectedHashKey(docHashKey);
    this.navToDocDetail();
  }

  /**
   * @description Change value of number of articles in one page and load the result list again.
   * @param num new number of articles in one page.
   */
  docNumPerPageChange(num: number) {
    this.pageSize = num;
    this.elasticsearchService.setNumDocsPerPage(num);
    this.elasticsearchService.setCurrentSearchingPage(1);
    this.ngOnInit();
  }

  /**
   * @description Chage arrow icon when user click on related article toggle.
   * @param idx
   */
  toggleArrowStyle(idx: number) {
    if (this.relatedDocBtnToggle[idx] !== true) {
      return {
        "background-image":
          "url(../../../../assets/icons/arrow-down_3d3d3d.png)",
      };
    }else{
      return {
        "background-image":
          "url(../../../../assets/icons/arrow-down_3d3d3d_2.png)",
      };
    }
  }

  navToDocDetail(): void {
    this.router.navigateByUrl("search/read");
  }

  async searchByDoctype(e){
    if(e.target.id === 'all'){
      this.elasticsearchService.setDoctype("");
    }else{
      this.elasticsearchService.setDoctype(e.target.value);
    }
    this.elasticsearchService.setSearchMode(SearchMode.FILTER);
    this.elasticsearchService.triggerSearch(1)
  }

  saveSortOption(ord: string){
    switch (ord){
      case '정확도순':
        this.elasticsearchService.setSortOption(SortOption.SCORE);
        break;
      case '최신순':
        this.elasticsearchService.setSortOption(SortOption.DATE_DESC);
        break;
      case '과거순':
        this.elasticsearchService.setSortOption(SortOption.DATE_ASC);
        break;
    }
    let rootUrl = this.router.routerState.snapshot.url;

    if(rootUrl.startsWith('/library')){
      this.elasticsearchService.setSearchMode(SearchMode.LIBRARY);
    }else{
      this.elasticsearchService.setSearchMode(SearchMode.FILTER);
    }
    this.elasticsearchService.triggerSearch(1);
  }

  // getters and setters
  public get form(): FormGroup {
    return this._form;
  }
  public set form(value: FormGroup) {
    this._form = value;
  }

  public get relatedDocs(): ArticleSource[][] {
    return this._relatedDocs;
  }
  public set relatedDocs(value: ArticleSource[][]) {
    this._relatedDocs = value;
  }
  public get articleNumChange$(): Observable<any> {
    return this._articleNumChange$;
  }
  public set articleNumChange$(value: Observable<any>) {
    this._articleNumChange$ = value;
  }
  public get articleChange$(): Observable<ArticleSource[]> {
    return this._articleChange$;
  }
  public set articleChange$(value: Observable<ArticleSource[]>) {
    this._articleChange$ = value;
  }
  public get searchStatusChange$(): Observable<boolean> {
    return this._searchStatusChange$;
  }
  public set searchStatusChange$(value: Observable<boolean>) {
    this._searchStatusChange$ = value;
  }
  public get articleNumSubscriber(): Subscription {
    return this._articleNumSubscriber;
  }
  public set articleNumSubscriber(value: Subscription) {
    this._articleNumSubscriber = value;
  }
  public get articleSubscriber(): Subscription {
    return this._articleSubscriber;
  }
  public set articleSubscriber(value: Subscription) {
    this._articleSubscriber = value;
  }
  public get articleSources(): ArticleSource[] {
    return this._articleSources;
  }
  public set articleSources(value: ArticleSource[]) {
    this._articleSources = value;
  }
  public get relatedDocBtnToggle(): Array<boolean> {
    return this._relatedDocBtnToggle;
  }
  public set relatedDocBtnToggle(value: Array<boolean>) {
    this._relatedDocBtnToggle = value;
  }

  public get isResultFound(): boolean {
    return this._isResultFound;
  }
  public set isResultFound(value: boolean) {
    this._isResultFound = value;
  }
  public get isSearchDone(): boolean {
    return this._isSearchDone;
  }
  public set isSearchDone(value: boolean) {
    this._isSearchDone = value;
  }
  public get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }
  public set isLoggedIn(value: boolean) {
    this._isLoggedIn = value;
  }
  public get isMainSearch(): boolean {
    return this._isMainSearch;
  }
  public set isMainSearch(value: boolean) {
    this._isMainSearch = value;
  }
  public get searchResultNum(): string {
    return this._searchResultNum;
  }
  public set searchResultNum(value: string) {
    this._searchResultNum = value;
  }

  public get searchPaperResultNum(): string {
    return this._searchPaperResultNum;
  }
  public set searchPaperResultNum(value: string) {
    this._searchPaperResultNum = value;
  }
  public get searchNewsResultNum(): string {
    return this._searchNewsResultNum;
  }
  public set searchNewsResultNum(value: string) {
    this._searchNewsResultNum = value;
  }
  public get searchKeyword(): string {
    return this._searchKeyword;
  }
  public set searchKeyword(value: string) {
    this._searchKeyword = value;
  }
  public get currentPage(): number {
    return this._currentPage;
  }
  public set currentPage(value: number) {
    this._currentPage = value;
  }
  public get pages(): number[] {
    return this._pages;
  }
  public set pages(value: number[]) {
    this._pages = value;
  }
  public get startIndex(): number {
    return this._startIndex;
  }
  public set startIndex(value: number) {
    this._startIndex = value;
  }
  public get totalPages(): number {
    return this._totalPages;
  }
  public set totalPages(value: number) {
    this._totalPages = value;
  }
  public get totalDocs(): number {
    return this._totalDocs;
  }
  public set totalDocs(value: number) {
    this._totalDocs = value;
  }
  public get pageSize(): number {
    return this._pageSize;
  }
  public set pageSize(value: number) {
    this._pageSize = value;
  }

  public get checkArray(): FormArray {
    return this._checkArray;
  }
  public set checkArray(value: FormArray) {
    this._checkArray = value;
  }
  public get toggle_all(): boolean {
    return this._toggle_all;
  }
  public set toggle_all(value: boolean) {
    this._toggle_all = value;
  }
  public get selectedDoctype(): string {
    return this.elasticsearchService.getDoctype();
  }

}
