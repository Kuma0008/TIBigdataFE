import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { QueryResponse } from "src/app/core/models/query.response.model";
import { UserProfile } from "src/app/core/models/user.model";
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
} from "angularx-social-login";
import { IpService } from "../ip-service/ip.service";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";

@Injectable({
  providedIn: "root",
})

/**
 * This service takes control of user related features such as login, logout, user session, user verification, etc.
 * The service sends query to mongodb in front-end server and do user-related works.
 */
export class AuthenticationService {
  private API_URL: string = this.ipService.getFrontDBServerIp();
  private headers = new HttpHeaders().set("Content-Type", "application/json");
  private currentUserChange$: BehaviorSubject<UserProfile> = new BehaviorSubject(null);
  private currentUser: UserProfile;
  private isLoggedIn: boolean;
  private UPDATE_API_AUTH = this.API_URL + "/users/apiRegister";
  private PROVIDER_ID: string =
    "576807286455-35sjp2v8leqpfeg3qj7k2rfr3avns7a5.apps.googleusercontent.com";

  constructor(
    private httpClient: HttpClient,
    public router: Router,
    private ipService: IpService,
    private socialAuthService: SocialAuthService
  ) {
    // update user state when there is change in current authentication
    this.currentUserChange$.subscribe((currentUser: UserProfile) => {
      this.isLoggedIn = currentUser != null;
    });
  }

  /**
   * @description When currentUser state changed, send signal to all subscripbers.
   * @returns Observable of current user.
   */
  getCurrentUserChange(): Observable<UserProfile> {
    return this.currentUserChange$.asObservable();
  }

  /**
   * @description Data of current user that this service holds.
   * @returns Current user data.
   */
  getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  /**
   * @description Update current user state
   * @param userProfile Current logged in user information
   */
  setCurrentUser(userProfile: UserProfile): void {
    this.currentUser = userProfile;
    this.currentUserChange$.next(userProfile);
  }

  /**
   * @description Register user into mongodb. Register user only if the user's email does not exist in database.
   * @param user User information to register.
   * @returns Result of registration.
   */
  async register(user: UserProfile): Promise<boolean> {
    let userDataFromGoogle: SocialUser = await this.getSocialAccountInfo();
    this.disposeSocialAccountInfo();
    if (await this.verifyUser(userDataFromGoogle.email)) return false;

    let userData: UserProfile = new UserProfile(userDataFromGoogle);
    userData.inst = user.inst;
    userData.status = user.status;

    let res: QueryResponse = await this.httpClient
      .post<any>(`${this.API_URL}/users/registerUser`, userData)
      .toPromise();

    return res.isSuccess;
  }

  /**
   * @description Sign in user and create token for session.
   * @returns Either the sign in successed or not.
   */
  async signIn(): Promise<boolean> {
    let socialAccountInfo = await this.getSocialAccountInfo();
    if (await this.verifyUser(socialAccountInfo.email)) {
      this.setCurrentUser(await this.getUserProfile(socialAccountInfo.email));
      this.setToken(socialAccountInfo);
      return true;
    } else {
      this.disposeSocialAccountInfo();
      return false;
    }
  }

  /**
   * @description Sign out user. Remove token from browser and clear saved user information
   */
  signOut(): void {
    this.socialAuthService.signOut();
    localStorage.removeItem("KUBIC_TOKEN");
    this.setCurrentUser(null);
    this.router.navigateByUrl("/");
  }

  /**
   * @description Get user information that has the given email address
   * @param email
   * @returns User information. If there is no user with the email, return null
   */
  async getUserProfile(email: string): Promise<UserProfile> {
    let res: QueryResponse = await this.httpClient
      .post<any>(`${this.API_URL}/users/getUserInfo`, {
        email: email,
        headers: this.headers,
      })
      .toPromise();
    return res.payload["userProfile"];
  }

  /**
   * @description Send query to front-end database server to check the given email is valid user
   * @param email
   * @returns Either the database has information of user with given email or not
   */
  async verifyUser(email: string): Promise<boolean> {
    let res: QueryResponse = await this.httpClient
      .post<any>(`${this.API_URL}/users/verifyUser`, { email: email })
      .toPromise();
    return res.payload["isRegistered"];
  }

  /**
   * @description Verify user's signin status by checking user's token. If it is a valid user, update the current logged in user information
   * @returns Either the user is valid or not
   */
  async verifySignIn(): Promise<boolean> {
    let token = this.getToken();
    if (token) {
      let verifyResult: QueryResponse = await this.verifyToken(token);
      if (verifyResult.isSuccess) this.setCurrentUser(verifyResult.payload["userProfile"]);
      return verifyResult.isSuccess;
    }
    return false;
  }

  /**
   * @description Verify user's token to check if it is expired or invalid token
   * @returns Either the user's token is available or not
   */
  async verifyToken(token: string): Promise<QueryResponse> {
    var client = this.PROVIDER_ID;
    return await this.httpClient
      .post<any>(`${this.API_URL}/users/verifyToken`, {
        token: token,
        client: client,
      })
      .toPromise();
  }

  /**
   * @description Register user as a api user. Update user's api authentication status
   * @returns If the register sucessfully done, return true. If it is failed, return false.
   */
  async apiRegister(): Promise<boolean> {
    let res: QueryResponse = await this.httpClient
      .post<any>(this.UPDATE_API_AUTH, { payload: this.currentUser.email })
      .toPromise();
    return res.isSuccess;
  }

  /**
   * @description Sign in user into google account and get user information that is saved in google account.
   */
  async getSocialAccountInfo(): Promise<SocialUser> {
    return await this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  /**
   * @description Sign out user from goole account.
   */
  async disposeSocialAccountInfo(): Promise<void> {
    await this.socialAuthService.signOut();
  }

  /**
   * @description Get token that is saved in browser.
   */
  getToken(): string {
    return localStorage.getItem("KUBIC_TOKEN");
  }

  /**
   * @description Save user's token into browser with token from google api.
   * @param userData
   */
  setToken(userData: SocialUser): void {
    localStorage.setItem("KUBIC_TOKEN", userData.idToken);
  }

  /**
   * @description Get sign in status of user.
   * @returns user logged in status
   */
  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  /**
   * @description Delete user from database and update user status history.
   * @returns Deleting result.
   */
  async deleteUser(): Promise<boolean> {
    let userDeleteRes: QueryResponse = await this.httpClient
      .post<any>(`${this.API_URL}/users/deleteUser`, {
        email: this.currentUser.email,
      })
      .toPromise();
    let myDocDeleteRes: QueryResponse = await this.httpClient
      .post<any>(`${this.API_URL}/myDoc/deleteAllMyDocs`, {
        userEmail: this.currentUser.email,
      })
      .toPromise();

    return (
      userDeleteRes.isSuccess === true && myDocDeleteRes.isSuccess === true
    );
  }
}
