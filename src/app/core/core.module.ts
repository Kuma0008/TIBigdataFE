import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from "angularx-social-login";
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { AuthGuard } from "./guards/auth-guard/auth.guard";
import { TokenInterceptorService } from "./interceptor/token-interceptor.service";
import { ElasticSearchQueryModel } from "./models/elasticsearch.service.query.model";
import { AnalysisDatabaseService } from "./services/analysis-database-service/analysis.database.service";
import { ArticleService } from "./services/article-service/article.service";
import { AuthenticationService } from "./services/authentication-service/authentication.service";
import { ElasticsearchService } from "./services/elasticsearch-service/elasticsearch.service";
import { IpService } from "./services/ip-service/ip.service";
import { PaginationService } from "./services/pagination-service/pagination.service";
import { UserSavedDocumentService } from "./services/user-saved-document-service/user-saved-document.service";
import { WordcloudService } from "./services/wordcloud-service/wordcloud.service";
import {TranslateModule} from '@ngx-translate/core';
import { CSVDownloadService } from "./services/csv-download-service/csv-download.service";




// Google API ID
export const PROVIDER_ID: string =
  "576807286455-35sjp2v8leqpfeg3qj7k2rfr3avns7a5.apps.googleusercontent.com";

@NgModule({
  declarations: [NavbarComponent, FooterComponent],
  imports: [CommonModule, SocialLoginModule, TranslateModule],
  exports: [NavbarComponent, FooterComponent],
  providers: [
    ElasticSearchQueryModel,
    AnalysisDatabaseService,
    ElasticsearchService,
    IpService,
    PaginationService,
    UserSavedDocumentService,
    WordcloudService,
    AuthenticationService,
    TokenInterceptorService,
    ArticleService,
    CSVDownloadService,
    AuthGuard,
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: true,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(PROVIDER_ID),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
})
export class CoreModule { }
