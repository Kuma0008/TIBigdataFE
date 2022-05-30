import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: "app-open-api-menu",
  templateUrl: "./open-api-menu.component.html",
  styleUrls: ["./open-api-menu.component.css"],
})
export class OpenApiMenuComponent implements OnInit {
  private _title: string = "";
  private _currentMenu: string = "";
  constructor(private router: Router,
              private translate: TranslateService) { }

  ngOnInit(): void {
    let url = this.router.url.split("/");
    this.currentMenu = url[url.length - 1];
    this.setTitle(this.currentMenu);
  }

  selectedStyleObject(flag: boolean): Object {
    if(matchMedia("(max-width: 425px)").matches) {
      if (flag) {
        return {
          color: "black",
          "font-weight": "bold",
          "border-bottom" : "0.2rem solid #0FBAFF",
        };
      } else {
        return {
          color: "#898C8D",
          "background-color": "white",
        };
      }
    }else{
      if (flag) {
        return {
          color: "#0FBAFF",
          "font-weight": "bold",
        };
      } else {
        return {
          color: "black",
          "background-color": "white",
        };
      }
    }
  }
  /**
   * @description Set title according to current address
   * @param currentAddress
   */
  setTitle(currentAddress: string) {
    if (currentAddress === "management") this.title = this.translate.instant('open-api.활용관리');
    if (currentAddress === "document") this.title = this.translate.instant('open-api.openAPIManual');
    if (currentAddress === "gotoapi") this.title = this.translate.instant('open-api.goToAPI');
    if (currentAddress === "register") this.title = this.translate.instant('open-api.callRequest');
  }

  toManagement() {
    this.router.navigateByUrl("/openapi/management");
    this.ngOnInit();
  }

  toDocument() {
    this.router.navigateByUrl("/openapi/document");
    this.ngOnInit();
  }

  toGotoapi() {
    this.router.navigateByUrl("/openapi/gotoapi");
    this.ngOnInit();
  }

  public get currentMenu(): string {
    return this._currentMenu;
  }
  public set currentMenu(value: string) {
    this._currentMenu = value;
  }
  public get title(): string {
    return this._title;
  }
  public set title(value: string) {
    this._title = value;
  }
}
