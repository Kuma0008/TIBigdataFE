import { Injectable, Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IpService } from 'src/app/ip.service'
import { DocumentService } from "../../../homes/body/search/service/document/document.service"

import {
  // AuthService,
  SocialUser,
  // GoogleLoginProvider,
} from "angularx-social-login";

//enumerate login status
enum logStat {
  unsigned,//0
  SUPERUSER,//1
  email,//2
  google,//3
}


/**
 * Token stored in front end browser.
 * check login type among email, google, facebook, etc...
 * check token value.
 */
class storeToken {
  //property coverage should be considered more... use private?
  type: logStat;
  token: string;

  constructor(type: logStat, token: string) {
    this.type = type;
    this.token = token
  }
}

@Injectable({
  providedIn: "root",
})
export class EPAuthService {
  private JC: string = "jcnam@handong.edu";
  private BAEK: string = "21500850@handong.edu";
  private SONG: string = "21500831@handong.edu";


  private URL = this.ipService.get_FE_DB_ServerIp();


  private EMAIL_REG_URL = this.URL + "/eUser/register"; //mongoDB
  private EMAIL_LOGIN_URL = this.URL + "/eUser/login";
  private EMAIL_VERIFY_TOKEN = this.URL + "/eUser/verify";
  private EMAIL_CHECK_OUR_USER_URL = this.URL + "/eUser/eCheckUser";

  private GOOGLE_REG_URL = this.URL + "/gUser/gRegister";
  private GOOGLE_CHECK_OUR_USER_URL = this.URL + "/gUser/check_is_our_g_user";
  private GOOGLE_VERIFY_TOKEN_URL = this.URL + "/gUser/verifyGoogleToken";

  private KEEP_MY_DOC_URL = this.URL + "/myDoc/keepMyDoc";
  private GET_MY_DOC_URL = this.URL + "/myDoc/getMyDoc";
  private ERASE_ALL_MY_DOC = this.URL + "/myDoc/eraseAllDoc";


  private ADD_SEARCH_HISTORY_URL = this.URL + "/hst/addHistory";
  private SHOW_SEARCH_HISTORY_URL = this.URL + "/hst/showHistory"

  private isLogIn: logStat = logStat.unsigned;//for static, inactive, passive use
  private isLogInObs$: BehaviorSubject<logStat> = new BehaviorSubject(logStat.unsigned);//to stream to subscribers
  private loginUserData = {};
  private socUser: SocialUser = null;//for social login
  private profile: {//for user profile
    name: String,
    email: String,
    history?: []
  };
  private schHst: [] = [];//user search history
  private myDocs: [] = [];
  constructor(
    private ipService: IpService,
    private injector: Injector,
    private http: HttpClient,
    private router: Router,
    // private gauth: AuthService,
    private docSvc: DocumentService
  ) {
    // this.isLogInObs$.next(logStat.unsigned);
  }


  forceLogOut() {
    alert("강제로 로그아웃 합니다. 새로고침 해야 적용 됨.");
    localStorage.removeItem("token");
  }



  /**
   * @CommonUserLoginFunctions
   * @description common login process for all login methods such as email, gmail, ...  
   */
  //check login state
  getLogInObs(): Observable<logStat> {
    return this.isLogInObs$;
  }

  getLogInStat(): logStat {
    return this.isLogIn;
  }
  setLogStat(stat) {
    this.isLogIn = stat as logStat;
  }

  getUserName(): String {
    return this.profile.name;
  }

  // getLogInStatObs() {//return type be logStat
  //   // var stat;
  //   return new Promise((resolve)=>{
  //     this.isLogInObs$.subscribe((res)=>{
  //       resolve(res)
  //     })
  //   })//그리고 나서 then((r)=>this.stat = r; if(this.stat == ... ){ ...})
  //   // return this.isLogInObs$.toPromise().then((res)=>res as logStat);
  //   // return
  //   // console.log(stat)
  //   // return this.isLogIn;
  // }

  // async logOutObs(){
  //   var stat = await this.getLogInStatObs();
  //     if (stat == logStat.email)
  //     this.eLogoutUser()
  //     else if(stat == logStat.google)
  //     this.gSignOut();

  //     if(stat == logStat.unsigned)
  //     new Error("logStat screwed up. need to be checked.");//in case of screwed up
  //     this.isLogInObs$.next(logStat.unsigned)
  //     this.router.navigate(["/homes"]);
  // }




  //get current token in this present browser.
  getToken() {
    return localStorage.getItem("token");
  }

  getNowUser(): SocialUser {
    return this.socUser;
  }

  //logout function for all login methods
  logOut() {

    if (this.isLogIn == logStat.email)
      this.eLogoutUser()
    else if (this.isLogIn == logStat.google)
      this.gSignOut();
    localStorage.removeItem("token");

    if (this.isLogIn == logStat.unsigned)
      new Error("logStat screwed up. need to be checked.");//in case of screwed up
    this.isLogInObs$.next(logStat.unsigned)
    this.router.navigate(["/homes"]);
  }


  //Check if this user has token, and if the token is valid.
  //called in the main home page.
  //When a user re-visit our app, should verify if token is valid
  // to decide the nav bar user name and user status.
  verifySignIn() {
    var isSignIn: boolean = false;
    var tk_with_type = JSON.parse(this.getToken());//token is stored in string.

    if (tk_with_type) {//when token exists
      var tk = tk_with_type.token;
      var type = tk_with_type.type;
      // console.log("Token found! : ", tk_with_type);

      if (type == logStat.google) {
        //console.log("token is from google");
        var gTkRes$ = this.gVerifyToken(tk);//verify it this token is valid or expired.
        gTkRes$.subscribe(
          tkStat => {
            //console.log(tkStat);
            if (tkStat.status) {//if token is valid
              this.socUser = tkStat.user;
              var n = this.socUser.name;
              var e = this.socUser.email;
              this.profile = { name: n, email: e };//profile property is used to show in nav bar.
              if (this.profile.email === this.JC || this.profile.email === this.BAEK || this.profile.email === this.SONG) {
                this.isLogIn = logStat.SUPERUSER;
              }
              else {
                this.isLogIn = logStat.google;//update token status 
              }
              //console.log("token verify succ");
              this.isLogInObs$.next(this.isLogIn);//send the news that token status is updated to other components
            }
            else {
              console.error("token verify fail");
            }
          },
          err => {
            console.error('error occurs! not google user : ', err);
          },
        );
      }

      else if (type == logStat.email) {
        //console.log("token is from email");
        var eTkRes$ = this.eVerifyToken(tk);
        eTkRes$.subscribe(
          res => {
            if (res.succ) {//token verify success
              //console.log(res);
              // else {
              //   this.isLogIn = logStat.google;//update token status 
              // }
              this.isLogIn = logStat.email;
              this.profile = { name: res.payload.name, email: res.payload.email };
              if (this.profile.email === this.JC || this.profile.email === this.BAEK || this.profile.email === this.SONG) {
                this.isLogIn = logStat.SUPERUSER;
              }
              // //console.log(this.profile);

              this.isLogInObs$.next(this.isLogIn);
            }
            else {//toekn verify failed
              if (res.msg == "expired") {
                alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                this.eLogoutUser();
                this.router.navigate(['/homes']);
              }
            }
          },
          err => {
            //console.log('error occurs! not email user : ', err);
          }
        )

      }
    }

    else {//when token does not exist.
      //console.log("token is not found. Hello, newbie!");
      //console.log("check the login stat as well : ", this.isLogIn);
      return isSignIn;
    }
  }
  //검색내역 history 추가 
  addSrchHst(keyword: string): void {
    // //console.log(this.socUser);


    if (this.isLogIn) {
      // //console.log("add serach history : user is login.", this.profile)
      let userEmail = this.profile.email;
      let bundle = { login: this.isLogIn, email: userEmail, key: keyword }
      this.http.post<any>(this.ADD_SEARCH_HISTORY_URL, bundle).subscribe((res) => {
        //console.log("history added raw result : ", res);
        this.schHst = res.history;
        //console.log("personal history : ", this.schHst);
      });
    }
    //비 로그인일 경우 문서 저장하지 않음.
    // else
    //   console.error("로그인 에러. 문서 저장 실패")

  }

  async showSrchHst() {
    // var hst;
    if (this.isLogIn) {
      console.log("add serach history : user is login.", this.profile)
      let userEmail = this.profile.email;
      let bundle = { login: this.isLogIn, email: userEmail }

      let res = await this.http.post<any>(this.SHOW_SEARCH_HISTORY_URL, bundle).toPromise()
      console.log("show search hist : ", res);
      if (res.succ)
        return res.payload.map(h => h.keyword);
      else
        return ["아직 검색 기록이 없어요. 검색창에 키워드를 입력해보세요."]
      // return 
      // this.http.post<any>(this.ADD_SEARCH_HISTORY_URL, bundle).subscribe((res) => {
      //   //console.log("history added raw result : ", res);
      //   this.schHst = res.history;
      //   //console.log("personal history : ", this.schHst);
      // });
    }
    else {
      console.log("비 로그인 상태")
      return Error;
    }


    // return new Promise((resolve) => {

    //     .subscribe((res) => {
    //       hst = res.history;
    //       resolve();
    //     });
    // }
    // )

  }

  async addMyDoc(docIDs) {
    let payload = { userEmail: this.profile.email, docs: docIDs };
    //console.log("keep doc sending data : ", payload);
    let res = await this.http.post<any>(this.KEEP_MY_DOC_URL, payload).toPromise()
    this.myDocs = res.myDoc;

  }

  /**
   * @description 저장한 나의 문서의 제목을 호출한다.
   * @param isId 문서의 id를 같이 요구한다면 true
   * @return string array
   */
  async getMyDocs(isId?: boolean) {
    //console.log("this.profile.email",this.profile.email);
    // this.myDocsTitles = [];
    // this.idList = await this.auth.getMyDocs() as string[];
    // payload = this.idList// unsure if remove just this.idListn now...
    // console.log(this.idList);
    let idRes = await this.http.post<any>(this.GET_MY_DOC_URL, { payload: this.profile.email }).toPromise();

    idRes = idRes.payload;
    console.log("get my doc : ", idRes);

    if (idRes) {
      if (isId) {//when request id list
        let titles = await this.docSvc.convertID2Title(idRes) as [];
        let i = -1;
        return titles.map(t => {
          i++
          return { title: t, id: idRes[i] }
        })
        // return 
      }
      else//when only requset titles
        return await this.docSvc.convertID2Title(idRes)
    }
    else if (idRes == null)//when null => when no keep doc. 
      return null

    // return 
    // Error("getMyDocs error in auth service")
    // return new Promise((r) => {
    //   this.http.post<any>(this.GET_MY_DOC_URL, { payload: this.profile.email }).subscribe((res) => {
    //     //console.log("angular get mydocs result : ",res);
    //     r(res.docs);
    //   });
    // })
  }

  async eraseAllMyDoc() {
    let res = await this.http.post<any>(this.ERASE_ALL_MY_DOC, { payload: this.profile.email }).toPromise()
    if (res.succ)
      alert("나의 문서를 모두 지웠어요.");
    else
      alert("문서 지우기에 실패했습니다. 관리자에게 문의해주세요.")
  }



  /***
   * @EmailUserLoginFunctinos
   * @description email login functions
   *  functions:
   */

  //email user : check if this user is already our user
  async eCheckUser(user: {}): Promise<any> {
    let isOurUser = await this.http.post<any>(this.EMAIL_CHECK_OUR_USER_URL, user).toPromise();

    return isOurUser;
  }


  //email registration function
  async eRegisterUser(user): Promise<any> {
    //console.log("user reg input : ", user);

    // let isOurUser$ = this.eCheckUser(user);
    // let res = await isOurUser$.toPromise();
    let isOurUser = await this.eCheckUser(user);
    //console.log(isOurUser);
    if (isOurUser.succ) {//if this user is one of us, deny registration.
      alert("이미 등록되어 있는 id 입니다. 로그인 페이지로 이동합니다.");
      //비밀번호 찾기 페이지도 만들어야 한다. 
      this.router.navigateByUrl("/membership/login");
    }
    else {
      this.http.post<any>(this.EMAIL_REG_URL, user)
        .subscribe(//perhaps return observable with response.
          res => {
            // //console.log(res)
            this.confirmUser(logStat.email, res);
            alert("반갑습니다." + res.payload.name + "님. 홈 화면으로 이동합니다.");
          },
          err => console.log(err)
        )
    }

  }

  //email sign in function
  async eLoginUser(user): Promise<any> {
    //console.log("login req user : ", user);

    let isOurUser = await this.eCheckUser(user);
    console.log(isOurUser);
    if (!isOurUser.succ) {//if this user is one of us, deny registration.
      alert("아직 KUBiC 회원이 아니시군요? 회원가입 해주세요! :)");
      //비밀번호 찾기 페이지도 만들어야 한다. 
    }
    else {
      //console.log("user input check : ", user);
      var result$ = this.http.post<any>(this.EMAIL_LOGIN_URL, user);
      result$.subscribe(
        res => {
          //console.log("login process result : ", res);
          // login succ
          if (res.succ)
            this.confirmUser(logStat.email, res);
          //login fail. maybe wrong password or id?
          if (!res.succ)
            alert("이메일 혹은 비밀번호가 잘못되었어요.");
        },
        err => {
          console.log(err)
        }
      )
    }
  }

  confirmUser(stat: logStat, res): void {
    //console.log(res);
    this.isLogIn = stat;
    localStorage.setItem('token', JSON.stringify(new storeToken(stat, res.payload.token)));
    if (stat === logStat.email)
      this.profile = { name: res.payload.name, email: res.payload.email };
    else { }//user for google. coupling for flexibility.
    this.router.navigate(['/homes']);
  }

  //email sign out function
  eLogoutUser(): void {
    localStorage.removeItem("token");
    // this.router.navigate(["/homes"]);
  }

  //email verify token
  eVerifyToken(token): Observable<any> {
    return this.http.post<any>(this.EMAIL_VERIFY_TOKEN, token);
  }




  /**
   * @GoogleSocialLogin
   * Google Social Login functions
   * Functions : login, checkUSer, register, signout, verify token
   */

  /**
   * @function gLogIn
   * @param platform 
   * @description user login with google social login
   * @uncomment
   */
  async gLogIn() {
    //   let response = await this.googleSignIn();

    //   // console.log(response)
    //   // this.http.get<any>("https://oauth2.googleapis.com/tokeninfo?id_token=" + response.authToken).subscribe(
    //   //   (res) => {

    //   //   console.log("resresres")
    //   //   console.log("GOOGLE AUTH DEBUG: ", res)
    //   // },err=>{
    //   //   if(err)
    //   //   console.error(err)
    //   // })

    //   //check if this user is our user already
    //   let res$ = this.check_is_our_g_user(response)
    //   res$.subscribe((res) => {
    //     if (res.exist == false) {
    //       //console.log("This user is not yet our user : need sign up : ", res);
    //       alert("아직 KUBiC 회원이 아니시군요?\n 반갑습니다!\n 회원가입 페이지로 이동합니다. :)");
    //       this.router.navigateByUrl("/membership/register");
    //     }
    //     else {
    //       //console.log("This user is already our user!");
    //       this.socUser = response as SocialUser;
    //       //console.log(this.socUser);
    //       localStorage.setItem('token', JSON.stringify(new storeToken(logStat.google, this.socUser.idToken)));

    //       // localStorage.setItem('token',this.socUser.idToken);
    //       //console.log("login user info saved : ", this.socUser);
    //       this.isLogIn = logStat.google;
    //       this.router.navigate(['/homes'])
    //     }
    //   }
    //   );
  }

  /**
   * @uncomment
   */
  async googleSignIn() {
    //   let platform = GoogleLoginProvider.PROVIDER_ID;
    //   return await this.gauth.signIn(platform);

    //   // return new Promise((resolve) => {
    //   //   .then((response) => {//error branch 추가할 필요성 있음...
    //   //     resolve(response);
    //   //   })
    //   // })

  }

  /**
   * @function check_is_our_g_user 
   * @param user
   * @description check if this user is already our user. check out from the DB. 
   */
  check_is_our_g_user(user: {}): Observable<any> {
    return this.http.post<any>(this.GOOGLE_CHECK_OUR_USER_URL, user);
  }

  gRegisterUser(user: any): Observable<any> {
    return this.http.post<any>(this.GOOGLE_REG_URL, user);
  }

  /**
   * @uncomment
   */
  gSignOut(): void {
    //   localStorage.removeItem("token");
    //   this.gauth.signOut();
    //   // this.isLogIn = logStat.unsigned;
  }

  //verify if this token is from google
  gVerifyToken(token: string): Observable<any> {
    // this.http.get<any>("https://oauth2.googleapis.com/tokeninfo?id_token=" + token).subscribe(res => {
    //   console.log("GOOGLE AUTH DEBUG: ", res)
    // })
    var client = this.injector.get("GOOGLE PROVIDER ID");//get google api client id from angular injector
    // console.log(client);
    return this.http.post<any>(this.GOOGLE_VERIFY_TOKEN_URL, { token: token, client: client });
  }

}
