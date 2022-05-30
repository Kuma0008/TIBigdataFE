import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IpService } from "src/app/core/services/ip-service/ip.service";
import { QueryResponse } from "../../models/query.response.model";
import { ArticleService } from "../article-service/article.service";

@Injectable({
    providedIn: "root",
})

export class AnalysisOnMiddlewareService {
    private middleware_URL = this.ipService.getMiddlewareServerIp();
    private frontDB_URL = this.ipService.getFrontDBServerIp();

    constructor(
        private ipService: IpService,
        private http: HttpClient,
        private docControl: ArticleService
        ) {}

    /**
     * @description send the data to middleware
     * @param route : subroute for the middleware ex) /textmining, /preprocessing
     * @param data : JSON.stringfy(object)
     * /textmining:
     * JSON.stringify({
      'userEmail': this.email, 
      'keyword': this.selectedKeyword, 
      'savedDate': this.selectedSavedDate,
      'option1': optionValue1,
      'option2': optionValue2,
      'option3': optionValue3,
      'analysisName': activity,
    })
     * 
     * /getPreprocessedData:
     * JSON.stringify({
      'userEmail': this.email, 
      'keyword': this.selectedKeyword, 
      'savedDate': this.selectedSavedDate,
      
      'synonym': (<HTMLInputElement>document.getElementById('synonym_user')).checked,
      'stopword': (<HTMLInputElement>document.getElementById('stopword_user')).checked,
      'compound': (<HTMLInputElement>document.getElementById('compound_user')).checked,
      'wordclass': wordclass.toString().padStart(3, '0') //(100) 동사, 010(명사), 001(형용사)
    })
     * @returns res
     */

    async postDataToMiddleware(route:string, data: string): Promise<any> {
        
        let res: QueryResponse = await this.http
            .post<any>(this.middleware_URL+route, data, {'headers':{'Content-Type': 'application/json'}})
            .toPromise();

            if(res == undefined) {
                // alert('내부적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요!');
                return null;
            }

        return res;
    }
    /**
     * @description send the data to frontend DB(node.js)
     * @see /TIBigdataFE/fe-backend/module/textMiningQuery.js
     * @param route : subroute for the frontend DB(node.js) ex) /uploadDict , /getPreprocessedData
     * @param data : /uploadDict(userEmail, dictType, csv), /getPreprocessedData(userEmail, savedDate)
     * @returns res
     */
    async postDataToFEDB(route:string, data: string): Promise<any> {
        
        let res: QueryResponse = await this.http
            .post<any>(this.frontDB_URL+route, data, {'headers':{'Content-Type': 'application/json'}})
            .toPromise();

            //if(res == undefined || res.isSuccess==false) alert('내부적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요!');

        return res.payload;
    }
}
