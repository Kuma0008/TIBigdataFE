import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { CommunityRoutingModule } from "./community.board-routing.module";
import { CommunityBoardComponent } from "./components/community-board-root/community.board.component";
import { AnnouncementComponent } from "./components/board-announcement/board.annoucement.component";
import { FaqComponent } from "./components/board-faq/board.faq.component";
import { QnaComponent } from "./components/board-qna/board.qna.component";
import { DocumentModifyComponent } from "./components/document-modify/document.modify.component";
import { DocumentReadComponent } from "./components/document-read/document.read.component";
import { DocumentWriteComponent } from "./components/document-write/document.write.component";
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    QnaComponent,
    DocumentWriteComponent,
    AnnouncementComponent,
    DocumentReadComponent,
    FaqComponent,
    DocumentModifyComponent,
    CommunityBoardComponent
  ],
    imports: [
        CommonModule,
        CommunityRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        TranslateModule,
    ],
})
export class CommunityBoardModule { }
