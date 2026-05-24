#!/bin/sh
set -e

ENV_FILE="$(dirname "$0")/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found"
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

if [ -z "$SMARTTHINGS_CLIENT_ID" ] || [ -z "$SMARTTHINGS_CLIENT_SECRET" ]; then
  echo "Error: SMARTTHINGS_CLIENT_ID and SMARTTHINGS_CLIENT_SECRET must be set in .env"
  exit 1
fi

REDIRECT_URI="https://httpbin.org/get"
ENCODED_REDIRECT=$(printf '%s' "$REDIRECT_URI" | jq -sRr @uri)
AUTH_URL="https://api.smartthings.com/oauth/authorize?client_id=${SMARTTHINGS_CLIENT_ID}&response_type=code&redirect_uri=${ENCODED_REDIRECT}&scope=r:devices:*+x:devices:*"

echo ""
echo "1. Open the following URL in your browser and log in with your Samsung account:"
echo ""
echo "   $AUTH_URL"
echo ""
echo "2. After login, find the \"code\" value in the JSON on httpbin.org"
echo "   e.g. \"url\": \"https://httpbin.org/get?code=xxxxxx\""
echo ""
printf "Enter code: "
read CODE

if [ -z "$CODE" ]; then
  echo "Error: No code entered"
  exit 1
fi

RESPONSE=$(curl -s -X POST https://api.smartthings.com/oauth/token \
  -u "${SMARTTHINGS_CLIENT_ID}:${SMARTTHINGS_CLIENT_SECRET}" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=${CODE}" \
  --data-urlencode "redirect_uri=${REDIRECT_URI}")

REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token // empty' 2>/dev/null)

if [ -z "$REFRESH_TOKEN" ]; then
  echo "Error: Failed to obtain refresh token. Response:"
  echo "$RESPONSE"
  exit 1
fi

if grep -q "^SMARTTHINGS_REFRESH_TOKEN=" "$ENV_FILE"; then
  sed -i.bak "s|^SMARTTHINGS_REFRESH_TOKEN=.*|SMARTTHINGS_REFRESH_TOKEN=${REFRESH_TOKEN}|" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
else
  echo "SMARTTHINGS_REFRESH_TOKEN=${REFRESH_TOKEN}" >> "$ENV_FILE"
fi

echo ""
echo "Done! .env updated with new refresh token."
echo "Run 'npm start' to start the server."
echo ""
