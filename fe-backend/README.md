# API Server for MongoDB on FrontEnd Server

This server is used as API server between Angular on FrontEnd side and MongoDB. All user-related queries and data anlaysis-related queries are sent to MongoDB through this server.

## Project Structure

```
- fe-backend
    - connection
    - labs
    - models
    - module
```

1. conncetion

   database 연결을 설정

   - config.js : MongoDB와의 연결을 설정
   - boardConn.js : `CommunityBoard` database와 연결을 설정
   - dataConn.js : `Analysis` database와 연결을 설정
   - userConn.js : `user` database와 연결을 설정

2. models

   각 콜렉션의 schema를 정의하고 collection 연결을 설정

   - announcement.js
   - faq.js
   - history.js `[Deprecated]`
   - myDoc.js
   - qna.js
   - rcmd.js
   - count.js
   - topic.js
   - user.js
   - userStatus.js
   - Res.js `[Response Structure]`

3. module

   쿼리를 요청하고 응답을 처리

   - annoucnemtnDocsQuery.js
   - faqDocsQuery.js
   - keepMyDocQuery.js
   - qnaDocsQuery.js
   - rcmdQuery.js
   - searchHistoryQuery.js `[Deprecated]`
   - countQuery.js
   - topicQuery.js
   - userAuthQuery.js

4. labs

   서버에 영향을 주지 않는 static data 처리를 위한 utils나 test code들을 저장

   - saveTFIDFintoMongo : tfidf 분석 결과를 MongoDB에 저장
   - saveTOPICSintoMongo : 주제 분석 결과를 MongoDB에 저장

## Collection Schema

1.  announcemnt : 공지사항 게시판의 문서를 저장하는 collection

    ```js
    const announcementDocSchema = new Schema({
      docId: Number,
      userName: String,
      userEmail: String,
      title: String,
      content: String,
      regDate: Date,
      modDate: Date,
      isMainAnnounce: Boolean,
    });
    ```

    - docId : Elasticsearch 와 일치하는 문서의 id
    - userName : 게시글을 등록한 사용자의 이름
    - userEmail : 게시글을 등록한 사용자의 이메일
    - title : 게시글 제목
    - content : 게시글 내용
    - regDate : 게시글 등록일
    - modDate : 게시글 수정일
    - isMainAnnounce : 게시판 상단 고정 여부

2.  faq : faq 게시판의 문서를 저장하는 collection

    ```js
    const faqDocSchema = new Schema({
      docId: Number,
      userName: String,
      userEmail: String,
      title: String,
      content: String,
      category: String,
    });
    ```

    - docId : Elasticsearch 와 일치하는 문서의 id
    - userName : 게시글을 등록한 사용자의 이름
    - userEmail : 게시글을 등록한 사용자의 이메일
    - title : 게시글 제목
    - content : 게시글 내용
    - category : 게시글의 카테고리

3.  myDoc : 사용자가 저장한 문서를 저장하는 collection

    ```js
    const keepDocSchema = new Schema({
      userEmail: String,
      savedDocIds: [],
    });
    ```

    - userEmail : 사용자의 이메일
    - savedDocIds : 사용자가 저장한 문서들의 id

4.  qna : qna 게시판의 문서를 저장하는 collection

    ```js
    const qnaDocSchema = new Schema({
      docId: Number,
      userName: String,
      userEmail: String,
      title: String,
      content: String,
      regDate: Date,
      modDate: Date,
      isAnswered: Boolean,
      reply: {
        userName: String,
        userEmail: String,
        title: String,
        content: String,
        regDate: Date,
        modDate: Date,
      },
    });
    ```

    - docId : Elasticsearch 와 일치하는 문서의 id
    - userName : 게시글을 등록한 사용자의 이름
    - userEmail : 게시글을 등록한 사용자의 이메일
    - title : 게시글 제목
    - content : 게시글 내용
    - regDate : 게시글 등록일
    - modDate : 게시글 수정일
    - isAnswered : 답변 등록 여부
    - reply: 등록된 답변 정보
      - userName : 답변을 등록한 사용자의 이름
      - userEmail : 답변을 등록한 사용자의 이메일
      - title : 답변 제목
      - content : 답변 내용
      - regDate : 답변 등록일
      - modDate : 답변 수정일

5.  rcmd : 연관문서 정보를 저장하는 collection

    ```js
    const rcmdSchema = new Schema({
      docID: String,
      rcmd: [],
      lastUpdate: Date,
    });
    ```

    - docID : 대상 문서의 ID
    - rcmd : 대상 문서와 연관된 문서들의 분석결과
    - lastUpdate : 연관문서 데이터가 업데이트된 날짜

6.  tfidf : tfidf 데이터 분석 정보를 저장하는 collection

    ```js
    const tfidfSchema = new Schema({
      docID: String,
      docTitle: String,
      tfidf: [],
      lastUpdate: Date,
    });
    ```

    - docID : 대상 문서의 ID
    - docTitle : 대상 문서의 제목
    - tfidf : 대상 문서의 tfidf 분석결과

7.  topic : 주제 분석 정보를 저장하는 collection

    ```js
    const topicSchema = new Schema({
      topic: String,
      docID: String,
      docTitle: String,
      lastUpdate: Date,
    });
    ```

    - topic : 문서의 주제
    - docID : 문서의 id
    - docTitle : 문서의 제목
    - lastUpdate : 마지막 분석 일자

8.  user : 사용자 정보를 저장하는 collection

    ```js
    const userSchema = new Schema({
      name: String,
      inst: String,
      email: String,
      status: String,
      isAdmin: Boolean,
      isApiUser: Boolean,
    });
    ```

    - name : 사용자의 이름
    - inst : 사용자의 소속기관
    - email : 사용자의 이메일
    - status : 사용자의 신분
    - isAdmin : 관리자 여부
    - isApiUser : OpenApi 발급여부

## API url and Functions

1. `/users` : 사용자와 관련된 쿼리 처리. userAuthQuery 로 연결

   - `/verifyUser` [POST] : 사용자가 이미 등록된 사용자인지 확인
   - `/registerUser` [POST] : 새로운 사용자를 등록
   - `/getUserInfo` [POST] : 사용자 정보를 요청
   - `/verifyToken` [POST] : 사용자의 토큰 정보가 유효한지 확인
   - `/deleteUser` [POST] : 사용자 탈퇴처리

2. `/myDoc` : 사용자가 보관함 문서에 대한 쿼리 처리. keepMyDocQuery로 연결

   - `/getMyDoc` [POST] : 사용자가 저장한 문서 정보를 요청
   - `/deleteAllMyDocs` [POST] : 사용자가 저장한 문서를 모두 삭제
   - `/saveMyDoc` [POST] : 새로운 문서를 저장

3. `/keyword` : 키워드에 관련된 쿼리 처리. tfidfQuery 로 연결

   - `/getKeyVal` [POST] : 특정 문서에 대한 tfidf 분석 결과를 요청

4. `/rcmd`

   - `/getRcmdTble` [POST] : 특정 문서에 대한 연관문서 정보를 요청

5. `/annoucement` : 공지사항 게시판에 대한 쿼리 처리. announcementDocsQuery로 연결

   - `/registerDoc` [POST] : 새로운 문서를 등록
   - `/getDocsNum` [POST] : 등록된 문서들의 개수 요청
   - `/getDocs` [POST] : 등록된 문서들의 요청
   - `/getMainAnnounceDocs` [POST] : 등록된 주요 공지 문서들을 요청
   - `/deleteDoc` [POST] : 문서 삭제
   - `/modDoc` [POST] : 문서 수정
   - `/getSingleDoc` [POST] : 문서 하나에 대한 정보 요청
   - `/searchDocs` [POST] : 문서 검색
   - `/searchDocsNum` [POST] : 문서 검색 결과의 문서 개수를 요청

6. `/qna` : QNA 게시판에 대한 쿼리 처리. qnaDocsQuery로 연결

   - `/registerDoc` [POST] : 새로운 문서를 등록
   - `/getDocsNum` [POST] : 등록된 문서들의 개수 요청
   - `/getDocs` [POST] : 등록된 문서들의 요청
   - `/getMainAnnounceDocs` [POST] : 등록된 주요 공지 문서들을 요청
   - `/deleteDoc` [POST] : 문서 삭제
   - `/modDoc` [POST] : 문서 수정
   - `/getSingleDoc` [POST] : 문서 하나에 대한 정보 요청
   - `/searchDocs` [POST] : 문서 검색
   - `/searchDocsNum` [POST] : 문서 검색 결과의 문서 개수를 요청

7. `/faq` : FAQ 게시판에 대한 쿼리 처리. faqDocsQuery로 연결

   - `/registerDoc` [POST] : 새로운 문서를 등록
   - `/getDocsNum` [POST] : 등록된 문서들의 개수 요청
   - `/getDocs` [POST] : 등록된 문서들의 요청
   - `/getMainAnnounceDocs` [POST] : 등록된 주요 공지 문서들을 요청
   - `/deleteDoc` [POST] : 문서 삭제
   - `/modDoc` [POST] : 문서 수정
   - `/getSingleDoc` [POST] : 문서 하나에 대한 정보 요청
   - `/searchDocs` [POST] : 문서 검색
   - `/searchDocsNum` [POST] : 문서 검색 결과의 문서 개수를 요청

8. `/topic` : 주제 분석 결과에 대한 쿼리 처리. topicQuery로 연결

   - `/getTopicCounts` [POST] : 주제별 문서 개수를 요청
   - `/getTopicTblPlain` [POST] : 전체 주제 분석 결과를 요청
   - `/getOneTopicDocs` [POST] : 특정 주제를 가진 문서들을 요청

## Getting Started

- Prerequisite: MongoDB should be installed and the service has been started. put `mongo` command on terminal to check if the service is running.

1. Install dependencies

```

npm install

```

2. run server

```

node server.js

```

[OPTIONAL] run server as error tracing mode

```

node server.js --trace-warnings

```
