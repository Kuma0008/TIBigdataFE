export class Article {
  doc_type: string;
  post_date: Date;
  post_title: string;
  post_writer: string;
  number: string;
  published_institution: string;
  published_institution_url: string;
  post_body: string;
  file_download_url: string;
  original_url: string;
  index: string;
}

export interface ArticleSource {
  source: Article;
}
