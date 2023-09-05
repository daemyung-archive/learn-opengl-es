# Read Me

이 예제는 WebGL2 를 사용하여 간단한 삼각형을 그리는 예제입니다.

## 요구 사항
node.js 를 설치해야 합니다.

## 실행 방법

```bash
$ cd ./node 
$ npm install
$ npm start &
$ cd ..
$ tsc
$ echo "$OSTYPE"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # 리눅스에서는 xdg-open을 사용하여 웹 브라우저 열기
    xdg-open index.html
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS에서는 open 명령어로 웹 브라우저 열기
    open index.html
elif [[ "$OSTYPE" == "win32" ]]; then
    # Windows 환경에서도 명령 프롬프트에서 start 명령어 사용
    start chrome index.html
else
    echo "지원하지 않는 운영체제입니다."
fi
```
