import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import moment from "moment";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { ApiInfo } from "../../models/api.model";
import { QueryResponse } from "../../models/query.response.model";
import { IpService } from "../ip-service/ip.service";

@Injectable({
    providedIn: "root",
  })
   

export class APIService {
private API_URL: string = this.ipService.getFrontDBServerIp();
  private _OpenAPI_URL: string = this.ipService.getOpenAPIServerIp();
  
private headers = new HttpHeaders().set("Content-Type", "application/json");
    // ipService: any;
// private currentUserChange$: BehaviorSubject<UserProfile> = new BehaviorSubject(null);
// private currentUser: UserProfile;
// private isLoggedIn: boolean;
// private UPDATE_API_AUTH = this.API_URL + "/users/apiRegister";
// private PROVIDER_ID: string =
//     "576807286455-35sjp2v8leqpfeg3qj7k2rfr3avns7a5.apps.googleusercontent.com";
//     ipService: any;
    constructor(
        private httpClient: HttpClient,
        public router: Router,
        private ipService: IpService,
    ) {}
 
 /**
   * @description Get user information that has the given email address
   * @param email
   * @returns User information. If there is no user with the email, return null
   */
   async getApiInfos(email: string): Promise<ApiInfo> {
    let res: QueryResponse = await this.httpClient
      .post<any>(`${this.API_URL}/api/getApiInfo`, {
        email: email,
      })
      .toPromise();
    
      for(let item of res.payload['info']){
        item.reporting_date = moment(new Date(item.reporting_date)).format('YYYY년 MM월 DD일 HH시 mm분');
        item.expiration_date = moment(new Date(item.expiration_date)).format('YYYY년 MM월 DD일 HH시 mm분');
      }
    return <ApiInfo> res.payload;
  }
  
  async reissueKey(email:string, _id: string): Promise<{authKey:string}> {
    let res: {authKey:string} = await this.httpClient
      .post<any>(this.OpenAPI_URL +'/reissue', 
      'email='+email+'&_id='+_id,
        {'headers':{'Content-Type': 'application/x-www-form-urlencoded'}},
      )
      .toPromise();
    // console.log(res);
    return res;
  }

  async register(email:string, app_type:string, app_name:string ,app_purpose: string): Promise<{authKey:string}>{
    let res: {authKey:string} = await this.httpClient
      .post<any>(this.OpenAPI_URL +'/register', 
        'email='+email+'&app_type='+app_type+'&app_name='+app_name+'&app_purpose='+app_purpose,
        {'headers':{'Content-Type': 'application/x-www-form-urlencoded'}},
      )
      .toPromise();
    // console.log(res);
    return res;
  }

  async delete(_id: string): Promise<{succeed:boolean}> {
    let res: {succeed:boolean} = await this.httpClient
      .post<any>(this.OpenAPI_URL +'/delete', 
        '_id='+_id,
        {'headers':{'Content-Type': 'application/x-www-form-urlencoded'}},
      )
      .toPromise();
    // console.log(res);
    return res;
  }

  public get OpenAPI_URL(): string {
    return this._OpenAPI_URL;
  }
  public set OpenAPI_URL(value: string) {
    this._OpenAPI_URL = value;
  }
}
