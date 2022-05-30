import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-userpage-header',
  templateUrl: './userpage-header.component.html',
  styleUrls: ['./userpage-header.component.css']
})
export class UserpageHeaderComponent implements OnInit {

  private _currentMenu: string = "";
  private _currentKeyword: string = "";

  constructor(
    private router: Router,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentMenu = this.convertRouteToKor(this.router.url.split('/')[2]);
      }
    });
  }

  ngOnInit(): void {
    this.currentMenu = this.convertRouteToKor(this.router.url.split('/')[2]);
  }

  /**
   * @description Return route name to Korean
   * @param routename
   */
  convertRouteToKor(routename: string) {
    if (routename === "my-docs") return "myDocuments";
    if (routename === "my-analysis") return "myAnalysis";
    if (routename === "secession") return "rmAccount"
    if (routename === "member-info") return "privacy"
  }

  public get currentMenu(): string {
    return this._currentMenu;
  }
  public set currentMenu(value: string) {
    this._currentMenu = value;
  }

  public get currentKeyword(): string {
    return this._currentKeyword;
  }
  public set currentKeyword(value: string) {
    this._currentKeyword = value;
  }

}
