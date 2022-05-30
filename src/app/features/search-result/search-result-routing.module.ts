import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ReadArticle } from "./components/read-article/read-article.component";
import { SearchResultComponent } from "./components/search-result/search-result.component";
import { KeywordAnalysisComponent } from './components/keyword-analysis/keyword-analysis.component';

const routes: Routes = [
  {
    path: "keywordAnalysis",
    component: KeywordAnalysisComponent,
  },
  {
    path: "result",
    component: SearchResultComponent,
  },
  {
    path: "read",
    component: ReadArticle,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule { }
