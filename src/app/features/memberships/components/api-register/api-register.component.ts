import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";

@Component({
  selector: "app-api-register",
  templateUrl: "./api-register.component.html",
  styleUrls: ["./api-register.component.less"],
})
export class ApiRegisterComponent implements OnInit {
  private _isAgreed: boolean = false;
  private _isMain: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private _router: Router,
  ) { }

  async ngOnInit() {
    if (this.authenticationService.getCurrentUser().isApiUser) {
      window.alert("이미 가입된 회원입니다.");
      this._router.navigateByUrl("/");
    }
  }

  /**
   * @description Register api and navigate to right page 
   */
  async registerApi(): Promise<void> {
    let res = await this.authenticationService.apiRegister();
    if (res) {
      this.authenticationService.getCurrentUser().isApiUser=true;
      window.alert("가입이 완료되었습니다!");
      this._router.navigateByUrl("/");
    }
    else {
      window.alert("가입에 실패했습니다. 다시 시도해주세요");
      this.ngOnInit();
    }
  }

  public get isAgreed(): boolean {
    return this._isAgreed;
  }
  public set isAgreed(value: boolean) {
    this._isAgreed = value;
  }

  gotoMain(): void {
    this._router.navigateByUrl("");
  }

  public get isMain():boolean{
    return this._isMain;
  }
}
