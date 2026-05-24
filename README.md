# home-control-server

REST API server for controlling SmartThings devices.

## Requirements

- Node.js v24+
- `jq` (for token script)
- Docker + Docker Compose (for production)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable                    | Description                            |
| --------------------------- | -------------------------------------- |
| `PORT`                      | Server port (default: `3000`)          |
| `API_KEY`                   | API key for request authentication     |
| `SMARTTHINGS_CLIENT_ID`     | SmartThings OAuth app Client ID        |
| `SMARTTHINGS_CLIENT_SECRET` | SmartThings OAuth app Client Secret    |
| `SMARTTHINGS_REFRESH_TOKEN` | Filled automatically by `get-token.sh` |

### 3. Obtain a Refresh Token

```bash
./scripts/get_token.sh
```

Walks through the SmartThings OAuth flow and writes the refresh token to `.env` automatically.

### 4. Configure devices

```bash
cp data/devices.json.example data/devices.json
```

Edit `data/devices.json` with your SmartThings device IDs:

```json
{
  "devices": [{ "id": "your-device-uuid", "name": "Living Room Light" }]
}
```

Changes to this file are reflected immediately without restarting the server.

## Running

### Local

```bash
npm start
```

### Docker (ARM64)

```bash
docker compose up -d
```

## API

All requests require the `x-api-key` header.

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| `GET`  | `/status`             | Get status of all devices |
| `POST` | `/devices/:id/toggle` | Toggle a device           |
| `POST` | `/devices/:id/on`     | Turn a device on          |
| `POST` | `/devices/:id/off`    | Turn a device off         |
| `POST` | `/all/on`             | Turn all devices on       |
| `POST` | `/all/off`            | Turn all devices off      |

### Example

```bash
curl http://localhost:3000/status -H "x-api-key: your-api-key"
```

```json
{
  "success": true,
  "message": "Status retrieved successfully",
  "result": [
    { "id": "a769c962-...", "name": "Living Room Light", "status": "on" }
  ]
}
```

## Token Management

The server automatically refreshes the access token 1 minute before expiry and updates the in-memory refresh token to prevent the 29-day expiration. If renewal fails, the process exits and Docker restarts it.

If the refresh token becomes invalid (e.g. after running manual API calls), re-run `./scripts/get_token.sh`.
