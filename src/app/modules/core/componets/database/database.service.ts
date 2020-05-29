import { Injectable, Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IpService } from 'src/app/ip.service'
import { IdControlService } from '../../../homes/body/search/service/id-control-service/id-control.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private URL = this.ipService.getUserServerIp();

  private GET_KEYWORDS_URL = this.URL + "/keyword/getKeyVal";
  private GET_RCMD_URL = this.URL + "/rcmd/getRcmdTbl";


  constructor(private ipService: IpService,
    private idControl: IdControlService,
    private http: HttpClient,
  ) { }

  /**
    * @Param ids : id string array
    * @Param num : how many related documetns per each document? defualt = 5 if undefined.
  */
  async getRcmdTable(ids: string | string[], num?: number) {
    console.log("in db rcmd : ", ids);
    return new Promise(resolve => this.http.post<any>(this.GET_RCMD_URL, { "id": ids, "num": num }).subscribe(rcmd_table => {
      // console.log("tfidf val result : ");
      console.log(rcmd_table);
      resolve(rcmd_table);
    })
    )
  }

  /**
    * @Param ids : id string array
    * @Param num : how many related documetns per each document? defualt = 5 if undefined.
  */
  async getTfidfValue(ids: string[], num?: number) {
    // console.log(ids);


    return new Promise(resolve => this.http.post<any>(this.GET_KEYWORDS_URL, { "id": ids, "num": num }).subscribe(tfidf_table => {
      // console.log("tfidf val result : ");
      // console.log(tfidf_table);
      resolve(tfidf_table);
    })
    )
  }

  async getRelatedDocs(id: string) {
    let _rcmdIdsRes = await this.getRcmdTable(id)
    // .then(_rcmdIdsRes => {
    console.log("rcmdRes:", _rcmdIdsRes)
    let rcmdIds = _rcmdIdsRes[0]["rcmd"];
    let _titlesRes = await this.idControl.convertID2Title(rcmdIds as string[])
    // .then( => {
    console.log("rcmdRes:", rcmdIds)

    let titles = _titlesRes as []

    let i = 0;
    let relatedDocs = titles.map(t => {
      i++;
      return { "id": rcmdIds[i], "title": t };
    })



    console.log("relatedDocs:", relatedDocs);
    return relatedDocs;
  // })
  // }
// });
}

}