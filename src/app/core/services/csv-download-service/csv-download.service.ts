import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CSVDownloadService {
  constructor() { }

  /**
   * @description download csv file
   * @param data in string 
   * @param name filename
   */
  downloadFile(str: string, name: string){
    const link = document.createElement("a");
    const fileName = name + '.csv';
    const blob = new Blob(["\uFEFF"+str], { type: 'text/csv; charset=utf-8'});
    const url = URL.createObjectURL(blob);
    $(link).attr({"download" : fileName, "href": url});
    link.click();
  }
  
  /**
   * @description convert data to csv in string type
   * @param data
   * @param headerList 
   * @param indexInculded wheter the data includes index or not, boolean
   */
  convertToCSV(data: any, headerList: any, indexIncluded: boolean){
    let array = typeof data != 'object' ? JSON.parse(data) : data;
    let str = '';
    let row : string;

    if(!indexIncluded)  
      row = 'index,';
    else             
      row = '';
    
    for(let i in headerList)
      row += headerList[i] + ',';
    
    row = row.slice(0,-1);
    str += row + '\r\n';

    if(!indexIncluded){
      for(let i=0; i<array.length; i++){
        let line = (i+1) + '';
        for(let index in headerList){
          let head = headerList[index];
          line += ',' + array[i][head];
        }
        str += line + '\r\n';
      }
    }
    else{
      for(let i=0; i<array.length; i++){
        let line = '';
        for(let index in headerList){
          let head = headerList[index];
          line += array[i][head] + ',';
        }
        str += line + '\r\n';
      }
    } 
    return str;
  } 

  /**
   * @description download analyzed data into csv file
   * @param data 
   * @param activity activity of the analysis
   */
  downloadCSV_analysis(data: any, activity: string){
    let str: string;
    let headerList : any;
    let indexIncluded : boolean;

    if(activity == 'count'){
        headerList = ["word", "value"];
        indexIncluded = false;
    }
    else if(activity == 'tfidf'){
        headerList = ["word", "value"];
        indexIncluded = false;
    }
    else if(activity == 'network'){
        headerList = ["id", "name", "degree_cen", "eigenvector_cen", "closeness_cen", "between_cen", "count"];
        indexIncluded = true;
    }
    else if(activity == 'kmeans'){
        headerList = ["category", "x", "y", "title"];
        indexIncluded = true;
    }
    else if(activity == 'word2vec'){
        headerList = ["word", "x", "y", "wcount"];
        indexIncluded = false;
    }

    str = this.convertToCSV(data, headerList, indexIncluded);
    console.log(str);
    this.downloadFile(str, activity);
  }

  /**
   * @description download dictionary into csv file
   * @param dictType 
   * @param dicData 
   */
  downloadCSV_dict(dictType: string, dictData: any) {
    let keys;
    let values;
    if(dictType == 'synonym'){
      keys = Object.keys(dictData.synonym);
      values = Object.values(dictData.synonym);
    }else if(dictType == 'stopword'){
      keys = Object.keys(dictData.stopword);
      values = Object.values(dictData.stopword);
    }else if(dictType == 'compound'){
      keys = Object.keys(dictData.compound);
      values = Object.values(dictData.compound);
    }
    
    let str = '';
    for(let i=0; i<keys.length; i++){
      let line = '';
      line += keys[i];
      for(let j=0; j<Object.keys(values[i]).length; j++){
        line += ',' + values[i][j];
      }
      str += line + '\r\n';
    }

    console.log(str);
    this.downloadFile(str, dictType);
  }
}
