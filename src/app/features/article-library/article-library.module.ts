import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LibraryRoutingModule } from "./article-library-routing.module";
import { ResearchStatusComponent } from "./components/research-status/research-status.component";
import { ArticleLibraryComponent } from "./components/article-library-root/article-library.component";
import { ChartsModule } from "ng2-charts";
import { SharedModule } from "src/app/shared/shared.module";
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [ArticleLibraryComponent, ResearchStatusComponent],
  imports: [CommonModule, ChartsModule, LibraryRoutingModule, SharedModule, TranslateModule],
})
export class ArticleLibraryModule { }
