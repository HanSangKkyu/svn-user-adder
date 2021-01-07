# svn-user-adder
쉽게 svn 유저를 추가할 수 있게 도와주는 프로그램
## Description
svn 경로를 입력하고, 추가할 유저목록을 입력하면 svn 유저가 추가됩니다.     
사용된 기술 : nodejs, electron
## Visuals
![image](https://user-images.githubusercontent.com/31759313/103838133-a4e73400-50cf-11eb-84d8-480d826dd8a6.png)
## Installation
+ 시작하기
``` bash
npm install
npm start
```
+ exe 파일 만들기
``` bash
npm install electron-packager --save-dev
npm install electron-packager -g
electron-packager ./ svn-user-adder --platform=win32 --arch=x64
```
## Usage
0. configure.conf 파일을 열어서 svn 경로를 지정해준다.
1. svn 경로 입력 (svn://loaclhost/repo1)
2. 추가할 유저 ID 입력 (여러 유저를 개행으로 입력 가능)
3. 만들기 버튼 클릭
