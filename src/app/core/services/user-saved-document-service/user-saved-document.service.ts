import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";
import { QueryResponse } from "src/app/core/models/query.response.model";
import { ArticleService } from "src/app/core/services/article-service/article.service";
import { UserProfile } from "src/app/core/models/user.model";
import { IpService } from "../ip-service/ip.service";
import { MydocModel } from "../../models/mydoc.model";
import moment from "moment";

@Injectable({
  providedIn: "root",
})

export class UserSavedDocumentService {
  private API_URL: string = this.ipService.getFrontDBServerIp();
  private saveMyDocUrl = this.API_URL + "/myDoc/saveMyDoc";
  private getMyDocUrl = this.API_URL + "/myDoc/getMyDoc";
  private getAllMyDocUrl = this.API_URL + "/myDoc/getAllMyDoc";
  private setPreprocessedUrl = this.API_URL + "/myDoc/setPreprocessed";
  private deleteAllMyDocUrl = this.API_URL + "/myDoc/deleteAllMyDocs";
  private deleteSelectedMyDocUrl = this.API_URL + "/myDoc/deleteSelectedMyDocs";
  private changeTitleMyDocs = this.API_URL + "/myDoc/changeTitleMyDocs";
  private currentUser: UserProfile;
  private docsPerPage: number = 10;

  //keywords
  private getMyKeywordsUrl = this.API_URL + "/myDoc/getMyKeyword";

  constructor(
    private httpClient: HttpClient,
    private authService: AuthenticationService,
    private articleService: ArticleService,
    private ipService: IpService
  ) {
    this.authService.getCurrentUserChange().subscribe((currentUser) => {
      this.currentUser = currentUser;

    });
  }

  /**
   * @description Send query of saving list of article HashKeys into saved document list
   * @param docHashKeys list of article HashKeys to save
   * @returns returns true if the saving success, else return false.
   */
  async saveNewMyDoc(docHashKeys: Array<string>, keyword: string): Promise<boolean> {
    let payload = { userEmail: this.currentUser.email, docHashKeys: docHashKeys, keyword : keyword };
    let res = await this.httpClient
      .post<any>(this.saveMyDocUrl, payload)
      .toPromise();
    return res.succ;
  }

  /**
   * @description Send query to get list of saved articles.
   * @returns Array of object that holds articles.
   */
  async getAllMyDocs(): Promise<Array<MydocModel>>{
    let res: QueryResponse = await this.httpClient
    .post<any>(this.getAllMyDocUrl, { userEmail: this.currentUser.email })
    .toPromise();

    let mydocs:Array<MydocModel> = res.payload["keywordList"];
    for(let doc of mydocs){
      let docHashKeys:Array<string> = doc["savedDocHashKeys"];
      doc['title'] = await this.articleService.convertDocHashKeysToTitles(docHashKeys);
      doc['savedDate_format'] = moment(new Date(doc['savedDate'])).format('YYYY년 MM월 DD일 HH시 mm분');
      doc['preprocessed'] = doc['preprocessed']==true? true:false;
    }

    return mydocs;
  }

  /**
   * @description Send query to delete all saved ariticles.
   * @returns Result of deleting operation.
   */
   async setMyDocPreprocessed(savedDate: string): Promise<void> {
    let res = await this.httpClient
      .post<any>(this.setPreprocessedUrl, { userEmail: this.currentUser.email, savedDate: savedDate })
      .toPromise();
  }

  /**
   * @description Send query to get list of saved articles.
   * @param startIndex A index to indicate where to start search.
   * @returns Array of object that holds article title and article HashKey.
   */
  async getMyDocs(savedDate: string, startIndex?: number): Promise<Array<{ title: string; hashKey: string }>> {
    if (startIndex === undefined) { startIndex = 0; }
    let currentIndex = (startIndex - 1) * this.docsPerPage;

    let res: QueryResponse = await this.httpClient
      .post<any>(this.getMyDocUrl, { userEmail: this.currentUser.email, savedDate: savedDate })
      .toPromise();

    let docHashKeys: Array<string> = res.payload['keywordList'].find(object => "savedDocHashKeys" in object)["savedDocHashKeys"];
    let titles: Array<string> = await this.articleService.convertDocHashKeysToTitles(docHashKeys);
    let doctypes :Array<string> = await this.articleService.convertDocHashKeysToDoctypes(docHashKeys);
    let hashKeyIdx = 0;
    let doctypesIdx = 0;

    let HashKeysAndTitles = titles.map((title) => {
      return { title: title, hashKey: docHashKeys[hashKeyIdx++], doc_type: doctypes[doctypesIdx++] };
    });

    return HashKeysAndTitles;
  }

  /**
   * @description Send query to delete all saved ariticles.
   * @returns Result of deleting operation.
   */
  async eraseAllMyDocs(savedDate: string): Promise<boolean> {
    let res = await this.httpClient
      .post<any>(this.deleteAllMyDocUrl, { userEmail: this.currentUser.email, savedDate: savedDate })
      .toPromise();
    return res.succ;
  }

  /**
   * @description Send query to get total number of saved articles.
   * @retursn Number of saved articles.
   */
  async getTotalDocNum(keyword: string, savedDate: string): Promise<number> {
    let res: QueryResponse = await this.httpClient
      .post<any>(this.getMyDocUrl, { userEmail: this.currentUser.email, keyword: keyword, savedDate: savedDate})
      .toPromise();

    let docHashKeys: Array<string> = res.payload['keywordList'].find(object => "savedDocHashKeys" in object)["savedDocHashKeys"];

    return docHashKeys.length;
  }

  //keywords
  async getMyKeywords(): Promise<Array<{ keyword: string, savedDate: string; }>> {
    let res: QueryResponse = await this.httpClient
      .post<any>(this.getMyKeywordsUrl, { userEmail: this.currentUser.email })
      .toPromise();
    let keywordList: Array<{ keyword: string, savedDate: string; }> = res.payload['keywordList'];

    return keywordList;
  }

  async eraseSelectedMyDocs(docHashKeys: Array<string>, savedDate: string): Promise<boolean> {
    let res = await this.httpClient
      .post<any>(this.deleteSelectedMyDocUrl, { userEmail: this.currentUser.email, docHashKeys: docHashKeys, savedDate: savedDate })
      .toPromise();
    return res.succ;
  }

  async changeFolderTitle(title : string, savedDate: string){
    let res = await this.httpClient
      .post<any>(this.changeTitleMyDocs, { userEmail: this.currentUser.email, keyword: title, savedDate: savedDate })
      .toPromise();
    return res.succ;
  }
}
