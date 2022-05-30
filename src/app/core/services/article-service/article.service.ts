import { Injectable } from "@angular/core";
import { ElasticsearchService } from "src/app/core/services/elasticsearch-service/elasticsearch.service";
import { ArticleSource } from "../../models/article.model";

@Injectable({
  providedIn: "root",
})
export class ArticleService {
  private selectedHashKey: string;
  private hashKeyList: Array<string>;
  private article: ArticleSource;

  constructor(private elasticsearchService: ElasticsearchService) { }

  /**
   * @description get list of article ids collected by ES search and convery them into list of article titles.
   * @param hashKeys list of ids in string
   * @returns list of article titles
   */
  async convertDocHashKeysToTitles(hashKeys: string[]): Promise<string[]> {
    let docTitles: Array<string> = new Array<string>(hashKeys.length);
    this.elasticsearchService.setHashKeys(hashKeys);
    await this.elasticsearchService.searchByManyHashKey().then((res) => {
      let articles: {}[] = res["hits"]["hits"];
      for (let i = 0; i < articles.length; i++) {
        let idx = hashKeys.indexOf(articles[i]["_source"]["hash_key"]);
        let extractedTitle: string = articles[i]["_source"]["post_title"];
        docTitles[idx] = extractedTitle.trim();
      }
    });
    docTitles = Array.from(docTitles, item => typeof item === 'undefined' ? "(삭제된 문서입니다.)" : item);
    return docTitles;
  }

  async convertDocHashKeysToDoctypes(hashKeys: string[]): Promise<string[]> {
    let doctype: Array<string> = new Array<string>(hashKeys.length);
    this.elasticsearchService.setHashKeys(hashKeys);
    await this.elasticsearchService.searchByManyHashKey().then((res) => {
      let articles: {}[] = res["hits"]["hits"];
      for (let i = 0; i < articles.length; i++) {
        let idx = hashKeys.indexOf(articles[i]["_source"]["hash_key"]);
        let extractedDoctype: string = articles[i]["_source"]["doc_type"];
        doctype[idx] = extractedDoctype.trim();
      }
    });
    return doctype;
  }

  /**
   * @description clear current list of articles
   */
  clearList(): void {
    this.hashKeyList = [];
    this.selectedHashKey = "";
  }

  /**
   * @description add article id into current list of articles
   * @param hashKey
   */
  addHashKey(hashKey: string): void {
    this.hashKeyList.push(hashKey);
  }

  /**
   * @description get current list of articles
   * @returns list of article ids in string
   */
  getList(): Array<string> {
    return this.hashKeyList;
  }

  /**
   * @description update current selected id
   * @param hashKey article id from ES that user wants to select
   */
  setSelectedHashKey(hashKey: string): void {
    this.selectedHashKey = hashKey;
  }

  /**
   * @description get currently selected article's id
   * @returns article id that user chose
   */
  getSelectedHashKey(): string {
    return this.selectedHashKey;
  }

  /**
   * @description get ArticleSource that holds all articles of search result
   * @returns article source
   */
  getArticle(): ArticleSource {
    return this.article;
  }

  /**
   * @description update article source that will be controlled by this service
   * @param art article source
   */
  setArticle(article: ArticleSource) {
    this.article = article;
  }

  /**
   * @description when index passed, return the article that located in the index from list of article ids.
   * @param index
   * @returns selected id from article id list
   */
  getHashKeyByIdx(index: number): string {
    return this.hashKeyList[index];
  }
}
