# home-control-server

SmartThings 기기를 제어하는 Express REST API 서버.

## 프로젝트 구조

```
src/
├── app.js                      # 진입점: 토큰 초기화 후 서버 기동
├── config/index.js             # 환경변수 로드 및 필수값 검증 (누락 시 exit)
├── api/
│   ├── middlewares/auth.js     # x-api-key 헤더 검증
│   └── routes/
│       ├── index.js            # /all/on, /all/off, /status
│       └── devices.js          # /devices/:id/toggle|on|off
├── loaders/express.js          # Express 미들웨어 및 에러 핸들러 설정
├── services/smartthings.js     # OAuth 토큰 관리 + SmartThings API 호출
└── util/
    ├── response.js             # success / fail 헬퍼
    └── message.js              # 응답 메시지 상수
data/
└── devices.json                # 기기 목록 (Docker volume 마운트, 재시작 불필요)
```

## 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `PORT` | 아니오 | 서버 포트 (기본값: 3000) |
| `API_KEY` | **예** | 요청 인증용 API 키 (`x-api-key` 헤더) |
| `SMARTTHINGS_CLIENT_ID` | **예** | SmartThings OAuth 앱 Client ID |
| `SMARTTHINGS_CLIENT_SECRET` | **예** | SmartThings OAuth 앱 Client Secret |
| `SMARTTHINGS_REFRESH_TOKEN` | **예** | SmartThings OAuth Refresh Token |

## 실행 방법

### 로컬

```bash
cp .env.example .env
# .env 값 입력
npm install
npm start
```

### Docker (TinkerBoard 2S / aarch64)

```bash
cp .env.example .env
# .env 값 입력
docker compose up -d
```

## API 엔드포인트

모든 요청에 `x-api-key: <API_KEY>` 헤더 필요.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/devices/:deviceId/toggle` | 현재 상태 반전 |
| `POST` | `/devices/:deviceId/on` | 기기 켜기 |
| `POST` | `/devices/:deviceId/off` | 기기 끄기 |
| `POST` | `/all/on` | 전체 기기 켜기 |
| `POST` | `/all/off` | 전체 기기 끄기 |
| `GET`  | `/status` | 전체 기기 상태 조회 |

## devices.json 형식

```json
{
  "devices": [
    { "id": "SmartThings-device-UUID", "name": "거실 조명" }
  ]
}
```

파일을 수정하면 다음 요청부터 즉시 반영됩니다 (서버 재시작 불필요).

## 토큰 관리

- 서버 시작 시 `SMARTTHINGS_REFRESH_TOKEN`으로 Access Token 발급
- Access Token 만료 1분 전 자동 갱신, Refresh Token도 함께 갱신
- 갱신 실패 시 `process.exit(1)` (systemd/Docker restart 정책에 위임)
