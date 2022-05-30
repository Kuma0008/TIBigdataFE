import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AnalysisDatabaseService } from "src/app/core/services/analysis-database-service/analysis.database.service";
import { ArticleService } from "src/app/core/services/article-service/article.service";

@Component({
  selector: "app-article-details",
  templateUrl: "article-card-preview.component.html",
  styleUrls: ["article-card-preview.component.less"],
})
export class ArticleCardViewComponent implements OnInit {
  @Input() article: any;

  constructor(
    private db: AnalysisDatabaseService,
    public _router: Router,
    private documentService: ArticleService
  ) { }
  private keywords: any[] = [];
  private docHashKey: string;
  private isDoc: string;
  private originalUrl: string;

  ngOnInit() {
    this.docHashKey = this.article._source.hash_key;
    this.article = this.article._source;
    if(this.article.doc_type == "paper"){
      this.isDoc = this.article.doc_type
    }else{
      this.isDoc = "news"
    }
    this.originalUrl = this.article.original_url
    this.loadTopKeywords();
    if (this.article.file_download_url === undefined) {
      this.article.file_download_url = this.article.published_institution_url;
    }
  }

  /**
   * @description Update selected article and navigate to read article page.
   */
  openDocDetail(): void {
    this.documentService.setSelectedHashKey(this.docHashKey);
    if(this.isDoc == "paper"){
      this.navToDocDetail();
    }else{
      window.open(this.originalUrl)
    }
  }

  /**
   * @description Load list of top keywords of current article
   */
  loadTopKeywords(): void {
    this.db.getCountVal(this.docHashKey).then((res) => {
      let data = res as [];
      if(data != null){
        for (let n = 0; n < data.length; n++) {
          let tfVal = data[n]["count"];
          this.keywords.push(tfVal);
        }
      }
    });
  }

  navToDocDetail(): void {
    this._router.navigateByUrl("search/read");
  }
}
