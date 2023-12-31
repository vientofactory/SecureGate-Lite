# SecureGate

# Deprecated

NestJS 기반의 백엔드 구현체로 변경과 프론트엔드 리팩토링이 있을 예정입니다.

# 개요

[SecureGate](https://securegate.gg) 프로젝트의 일부 기능을 제외하고 경량화시킨 오픈소스 버전입니다.

사용하시기 전에 위에 스타 한 번만 꾹 눌러주세요. 그거 누르는데 어렵지 않잖아요... ;)

# 시작하기 전에...

- 무중단 서비스 환경을 만들기 위해 PM2 사용을 추천합니다. 설치되어 있지 않다면 [여기](https://pm2.keymetrics.io/docs/usage/quick-start/)를 참고해서 설치 후 진행해주세요.
- 환경변수 (.env)를 적절히 수정해주세요.

# 환경변수 (.env)

## frontend

```env
BRAND="SecureGate"
BACKEND_HOST="http://localhost:3001"
FRONTEND_HOST="(프론트엔드 URL)"
RECAPTCHA_SITE="(reCAPTCHA 사이트 키)"
CLIENT_ID="(클라이언트 ID)"
CLIENT_SECRET="(클라이언트 시크릿키)"
PERMISSIONS="268453889"
VER="1.0.0"
```

## backend

```env
PORT="3001"
FRONTEND_HOST="(프론트엔드 URL)"
BRAND="SecureGate"
MONGODB_URI="(MongoDB URL)"
LOG_WEBHOOK="(로그 전송에 쓰일 웹후크 URL)"
BOT_TOKEN="(봇 토큰)"
CLIENT_ID="(클라이언트 ID)"
CLIENT_SECRET="(클라이언트 시크릿키)"
RECAPTCHA_SECRET="(reCAPTCHA 시크릿키)"
SUPERUSER="(최고관리자 ID)"
MAX_ALLOWED_INVITES="5" # 생성 가능한 최대 초대 링크 개수
SMTP_HOST="(SMTP 서버 주소)"
SMTP_PORT="(SMTP 서버 포트)"
SMTP_USER="(SMTP 사용자)"
SMTP_PASSWORD="(SMTP 비밀번호)"
SMTP_SENDER="(이메일 전송자)"
SMTP_SENDER_NAME="SecureGate" # 이메일 전송자명
VERIFY_HTML_TEMPLATE="verify.html"
EXPIRES="86400000"
```

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
yarn
```

## 4. 빌드 (frontend, backend)

```
yarn build
```

## 5-1. 서버 시작 (운영 환경)

```
cd frontend/
pm2 start
cd ..
cd backend/
pm2 start
```

## 5-2. 서버 시작 (개발 환경) (frontend, backend)

```
yarn dev
```

# 마치며...

프로젝트의 기여는 언제나 환영입니다. 기여를 원하신다면 프로젝트 포크, 수정 후 Pull Request를 올려주세요!
