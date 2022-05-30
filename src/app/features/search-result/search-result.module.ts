import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TagCloudModule } from "angular-tag-cloud-module";
import { SearchRoutingModule } from "./search-result-routing.module";

import { SearchResultFilterComponent } from "./components/search-result-filter/search-result-filter.component";
import { ReadArticle } from "./components/read-article/read-article.component";
import { SharedModule } from "src/app/shared/shared.module";
import { SearchResultComponent } from "./components/search-result/search-result.component";
import { KeywordAnalysisComponent } from './components/keyword-analysis/keyword-analysis.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    SearchResultComponent,
    SearchResultFilterComponent,
    ReadArticle,
    KeywordAnalysisComponent,
  ],
    imports: [
        CommonModule,
        SearchRoutingModule,
        FormsModule,
        TagCloudModule,
        SharedModule,
        TranslateModule,
    ],
})
export class SearchResultModule { }
