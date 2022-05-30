import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: "app-route-location",
  templateUrl: "./route-location.component.html",
  styleUrls: ["./route-location.component.css"],
})
export class RouteLocationComponent implements OnInit {

  private _dir: string = "홈";

  constructor(private router: Router, public translate: TranslateService) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    this.dir = "홈";
    let translatedDir = this.getTranslation(this.dir);
    let data = this.router.url;
    let routes: Array<string> = data.split("/");

    routes.forEach((route) => {
      let routeKor = this.convertRouteIntoKor(route);
      if (routeKor != null) this.dir = translatedDir + " > " + routeKor;
    });
  }

  /**
   * @description Convert route url into Korean route name.
   * @param routeName Route url parsed from router module.
   * @returns Korean route name.
   */
  convertRouteIntoKor(routeName: string): string {
    let word = '';
    if (routeName === "about") word = '홈페이지소개';
    else if (routeName === "intro") word = "사이트소개";
    else if (routeName === "member-policy") word = "회원정책";
    else if (routeName === "collected-info") word = "수집정보";
    else if (routeName === "service-guide") word = "서비스안내";
    else if (routeName === "search") word = "검색결과";
    else if (routeName === "read") word = "문서상세보기";
    else if (routeName === "anlaysis") word = "자료분석";
    else if (routeName === "library") word = "자료열람";
    else if (routeName === "research-status") word = "통일연구 동향 그래프";
    else if (routeName === "community") word = "커뮤니티";
    else if (routeName === "qna") return "QNA"
    else if (routeName === "faq") return "FAQ"
    else if (routeName === "announcement") word = "공지사항"
    else if (routeName === "new") word = "새 글 작성"
    else if (routeName === "modify") word = "글 수정"
    else if (routeName === "userpage") word = "마이페이지"
    else if (routeName === "my-docs") word = "내 보관함"
    else if (routeName === "my-analysis") word = "내 분석함"
    else if (routeName === "member-info") word = "회원 정보"
    else if (routeName === "secession") word = "회원 탈퇴"
    else if (routeName === "analysis") word = "분석"
    else if (routeName === "analysis-menu") word = "자료분석"
    else if (routeName === "manual") word = "매뉴얼"
    else if (routeName === "preprocessing") word = "전처리"
    else if (routeName === "openapi") return "Open API"
    return this.getTranslation(word);
  }

  public get dir(): string {
    return this._dir;
  }
  public set dir(value: string) {
    this._dir = value;
  }
  public getTranslation(str) {
    const currentLang = this.translate.currentLang; // get current language
    const returnValue = this.translate.translations[currentLang][str]; // get converted string from current language
    return returnValue;
  }
}
