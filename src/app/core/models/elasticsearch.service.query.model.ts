export class ElasticSearchQueryModel {
  private hashKeys: string[] = [];
  private searchKeyword: string = "";
  private sortOption: {};


  private searchSource = [
    "post_title",
    "post_date",
    "published_institution_url",
    "published_institution",
    "original_url",
    "post_writer",
    "post_body",
    "file_download_url",
    "hash_key",
    "doc_type"
  ];
  private searchField: string[] = [
    "post_title",
    "file_extracted_content",
    "post_body",
  ];
  private filterPath: string[] = [
    "hits.hits._source",
    "hits.hits._id",
    "hits.total",
    "_scroll_id",
    "hits.hits._source.hash_key",
  ];

  private sortByScoreDesc: {} = {
    _score: {
      order: "desc",
    },
  };

  private sortByDateAsc: {} = {
    post_date: {
      order: "asc",
    },
  };
  private sortByDateDesc: {} = {
    post_date: {
      order: "desc",
    },
  };

  public getAllDocs() {
    return {
      query: {
        match_all: {},
      },
    };
  }

  public getSearchDocs() {
    return {
      query: {
        multi_match: {
          query: this.searchKeyword,
          fields: this.searchField,
        },
      },
      sort: [this.sortOption],
    };
  }

  public getSearchDocCount() {
    return {
      query: {
        multi_match: {
          query: this.searchKeyword,
          fields: this.searchField,
        },
      },
    };
  }

  public getSearchSource() {
    return this.searchSource;
  }

  public getFilterPath() {
    return this.filterPath;
  }

  public getSearchField() {
    return this.searchField;
  }

  public getSearchHashKeys() {
    return {
      query: {
        terms : {
          hash_key: this.hashKeys,
        },
      },
    };
  }

  public setSearchKeyword(keyword: string) {
    this.searchKeyword = keyword;
  }

  public setSearchHashKeys(hashKeys: string[]) {
    this.hashKeys = hashKeys;
  }

  public setSortOption(op) {
    if (op === 0) this.sortOption = this.sortByDateAsc;
    if (op === 1) this.sortOption = this.sortByDateDesc;
    if (op === 2) this.sortOption = this.sortByScoreDesc;
  }

  public getSortOption(){
    return this.sortOption;
  }
}
