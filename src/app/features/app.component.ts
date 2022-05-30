import { Component } from "@angular/core";
import { ElasticsearchService } from "src/app/core/services/elasticsearch-service/elasticsearch.service";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";
import { Router, NavigationEnd } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { ArticleLibraryComponent } from './article-library/components/article-library-root/article-library.component';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent {
  title = "KUBiC";

  private _isUserLoaded = false;
  private _isBackendAvailable;
  private _isSearchbarNeeded = true;
  private language = '';

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private elasticsearchSearvice: ElasticsearchService,
    private translate: TranslateService,
    private articleLibrary: ArticleLibraryComponent,
  ) {
    this.isUserLoaded = false;
    this.isBackendAvailable = null;
    translate.setDefaultLang('ko');
    translate.use('ko');
    this.language = 'ko';
    //this.articleLibrary.setArrayValues('ko');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        try {
          let rootUrl = this.router.url.split("/")[1];

          if(rootUrl === "search" || rootUrl === "library" || rootUrl === "analysis-menu" || rootUrl === "openapi" || rootUrl === "community" || rootUrl === "about" || rootUrl === "userpage")
            this.isSearchbarNeeded = true;
          else
            this.isSearchbarNeeded = false;
        } catch (error) {
          this.isSearchbarNeeded = false;
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // this.isBackendAvailable = await this.elasticsearchSearvice.isAvailable();
    this.isBackendAvailable = true;
    if (localStorage.getItem("KUBIC_TOKEN") != null) {
      let isSuccess = await this.authenticationService.verifySignIn();
      if (!isSuccess) {
        this.isUserLoaded = false;
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        this.authenticationService.signOut();
        this.router.navigate(["/"]);
      }
      this.isUserLoaded = true;
    }
    else {
      this.isUserLoaded = true;
    }
  }
  public toKorean() {
    this.translate.use('ko');
    this.language = 'ko';
  }
  public toEnglish() {
    this.translate.use('en');
    this.language = 'en';
  }
  // getters and setters
  public get getLanguage() {
    return this.language;
  }
  public get isUserLoaded() {
    return this._isUserLoaded;
  }
  public set isUserLoaded(value) {
    this._isUserLoaded = value;
  }
  public get isBackendAvailable() {
    return this._isBackendAvailable;
  }
  public set isBackendAvailable(value) {
    this._isBackendAvailable = value;
  }
  public get isSearchbarNeeded() {
    return this._isSearchbarNeeded;
  }
  public set isSearchbarNeeded(value) {
    this._isSearchbarNeeded = value;
  }
}
