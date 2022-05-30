import urllib.request as r
import urllib.parse as p
import json
import pandas as pd

URL = "https://kubic.handong.edu:15000/"

################ Users can edit this part ################
# 검색 옵션을 입력해주세요
## 단순검색=simple_search
## 상세검색=detailed_search
## 내 보관함 검색=my_doc
search_option="simple_search" #detailed_search #my_doc
# 인증키를 입력해주세요
serviceKey = "pP5JG2d-TZohr1sWMRVIwg"
# 한 번에 출력할 문서 개수를 입력해주세요
numOfCnt = 200
# 검색할 키워드를 입력해주세요
keyword="북한"
#########################################################

loginKey = "serviceKey=" + serviceKey
request = "&numOfCnt="+p.quote(str(numOfCnt))+"&keyword="+p.quote(str(keyword))
URL_full = URL + search_option + "?" + loginKey + request

print("URL>" + URL_full)
response = r.urlopen(URL_full).read().decode('utf-8')

jsonArray = json.loads(response)

if jsonArray.get("header").get("resultCode") != 200:
    print("Error!!!")
    print(jsonArray.get("header"))
    quit()

items =jsonArray.get("body").get("contents")
print("items>", items)

df = pd.DataFrame(columns=['title','body','writer','date','category','institution','file'])
for item in items:
    df = df.append(item,ignore_index=True)
print(df)