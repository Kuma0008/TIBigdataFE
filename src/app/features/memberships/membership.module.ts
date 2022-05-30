import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SocialLoginModule } from "angularx-social-login";
import { CoreModule } from "src/app/core/core.module";
import { ApiRegisterComponent } from "./components/api-register/api-register.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterOkComponent } from "./components/register-ok/register-ok.component";
import { RegisterComponent } from "./components/register/register.component";
import { CommunicationRoutingModule } from "./membership-routing.module";
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    RegisterComponent,
    RegisterOkComponent,
    ApiRegisterComponent,
    LoginComponent,
  ],
    imports: [
        FormsModule,
        CommonModule,
        HttpClientModule,
        CommunicationRoutingModule,
        ReactiveFormsModule,
        SocialLoginModule,
        CoreModule,
        TranslateModule,
    ],
  providers: [],
})
export class MembershipModule { }
