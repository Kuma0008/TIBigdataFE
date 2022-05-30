import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AboutKubicRoutingModule } from "./about-kubic-routing.module";
import { IntroComponent } from "./components/intro/intro.component";
import { ServiceGuideComponent } from "./components/service-guide/service-guide.component";
import { CollectedInfoComponent } from "./components/collected-info/collected-info.component";
import { MemberPolicyComponent } from "./components/member-policy/member-policy.component";
import { AboutSideMenuComponent } from "./components/about-side-menu/about-side-menu.component";
import { SharedModule } from "src/app/shared/shared.module";
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    IntroComponent,
    ServiceGuideComponent,
    CollectedInfoComponent,
    MemberPolicyComponent,
    AboutSideMenuComponent,
  ],
    imports: [CommonModule, AboutKubicRoutingModule, SharedModule, TranslateModule],
})
export class AboutKubicModule {}
