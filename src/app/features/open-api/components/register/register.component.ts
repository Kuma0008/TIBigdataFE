import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { UserProfile } from "src/app/core/models/user.model";
import { APIService } from "src/app/core/services/api-database-service/api-database.service";
import { AuthenticationService } from "src/app/core/services/authentication-service/authentication.service";
import { ManagementComponent } from "../management/management.component";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.less"],
})
export class RegisterComponent implements OnInit{

    userProfile: UserProfile;
    ngOnInit(){
    }

    constructor(
        public router: Router,
        public apiService: APIService, 
        private authenticationService: AuthenticationService
        ) {
          this.authenticationService.getCurrentUserChange().subscribe((currentUser) => {
            this.userProfile = currentUser;
          });
        }

    async register():Promise<void>{
      
      let app_type :string = (<HTMLInputElement>document.getElementById('app_type_public')).checked ? 'public':'private';
      let app_name:string = (<HTMLInputElement>document.getElementById('app_name')).value;
      let app_purpose:string = (<HTMLInputElement>document.getElementById('app_purpose')).value;
      let res = await this.apiService.register(this.userProfile.email, app_type, app_name, app_purpose)
      let authKey = res.authKey;
      
      if(app_type=='public')  prompt('성공적으로 활용이 등록되었습니다.\n인증키를 복사하세요.',authKey);
      else if(authKey=='success') alert('성공적으로 승인메일을 관리자에게 보냈습니다.\n 승인이 되는대로 인증키를 메일로 보내드리겠습니다.');
      else alert('문제가 생겼습니다.\n 잠시후 다시 시도해주세요');

      return this.toManagement();
    }
    
    toManagement(){
        this.router.navigateByUrl("/openapi/management");
        this.ngOnInit();
    }
}