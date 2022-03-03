import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'myAnalysisPipe' })
export class MyAnalysisPipe implements PipeTransform{
    private _chartData : any;

    transform(chart: any): string{
        if(chart.activity === 'count' ){ 
            return '빈도수분석'
        }
        else if( chart.activity === 'tfidf' ){ 
            return 'TFIDF'
        }
        else if( chart.activity === 'kmenas' ){ 
            return '분할군집분석'
        }
        else if( chart.activity === 'network' ){ 
            return '의미연결망'
        }
        else if( chart.activity === 'hcluster' ){ 
            return '계층군집분석'
        }
        else if( chart.activity === 'ngrams' ){ 
            return 'N-gram'
        }
        else if( chart.activity === 'word2vec' ){ 
            return '유의어분석'
        }
        else if( chart.activity === 'topicLDA' ){ 
            return '토픽모델링'
        }


    }

    public get chartData() : any {
        return this._chartData;
      }
      public set chartData(value: any) {
        this._chartData = value;
      } 
}
