import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MemberInfoComponent } from "./components/member-info/member-info.component";
import { MyAnalysisComponent } from "./components/my-analysis/my-analysis.component";
import { MyDocsComponent } from "./components/my-docs/my-docs.component";
import { SecessionComponent } from "./components/secession/secession.component";
import { UserpageRoutingModule } from "./userpage-routing.module";
import { UserpageRootComponent } from './components/userpage-root/userpage-root.component';
import { UserpageSidebarComponent } from './components/userpage-sidebar/userpage-sidebar.component';
import { UserpageHeaderComponent } from './components/userpage-header/userpage-header.component';
import { ReactiveFormsModule } from "@angular/forms";
import { ModalComponent } from "./components/my-analysis/modal/showDetail.component";

@NgModule({
  declarations: [
    UserpageRootComponent,
    MyDocsComponent,
    MyAnalysisComponent,
    MemberInfoComponent,
    SecessionComponent,
    UserpageSidebarComponent,
    UserpageHeaderComponent,
    ModalComponent,
  ],
  imports: [CommonModule, UserpageRoutingModule, ReactiveFormsModule ],
})
export class UserpageModule { }
