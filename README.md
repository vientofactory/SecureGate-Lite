# SecureGate-Lite
SecureGate 프로젝트의 일부 기능을 제외하고 경량화시킨 오픈소스 버전입니다.

**AGPL 3.0 라이선스를 사용합니다.**

프로젝트 사용 전 라이선스 안내를 꼭 정독해주세요. 라이선스 미준수가 적발될 시 법적 조치가 이루어질 수 있습니다.

# 시작하기 전에...
 - 무중단 서비스 환경을 만들기 위해 PM2 사용을 추천합니다. 설치되어 있지 않다면 [여기](https://pm2.keymetrics.io/docs/usage/quick-start/)를 참고해서 설치 후 진행해주세요.
 - 환경변수 (.env)를 적절히 수정해주세요.

# 설치
## 1. 저장소 포크
```
git clone https://github.com/vientorepublic/SecureGate-Lite.git
```

## 2. 의존성 패키지 설치 (frontend)
```
cd frontend/
yarn
```

## 3. 의존성 패키지 설치 (backend)
```
cd backend/
sh setup.sh
```
(Yarn 입력으로 설치가 가능하지만, 언어 파일과 HTML 템플릿 자동 복사를 위해 셋업 스크립트 사용을 추천합니다.)

## 4. 빌드 (frontend)
```
yarn build
```

## 5. 서버 시작 (운영 환경)
```
cd frontend/
pm2 start
cd ..
cd backend/
pm2 start
```

# 마치며...
프로젝트의 기여는 언제나 환영입니다. 기여를 원하신다면 프로젝트 포크, 수정 후 Pull Request를 올려주세요!
