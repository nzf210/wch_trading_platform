#!/bin/bash
set -e

# Configuration
API_URL=${API_URL:-"http://localhost:8080"}
CORRELATION_ID="smoke-$(date +%Y%m%d-%H%M%S)"
TEST_EMAIL="smoke-$(date +%s)@example.com"
TEST_PASSWORD="password123"
TEST_NAME="Smoke Test User"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

query_db() {
  local sql=$1
  if command -v docker &> /dev/null && docker compose ps postgres | grep -q "Up"; then
    docker compose exec -T postgres psql -U wch_user -d wch_trading -t -c "$sql"
  else
    psql -U wch_user -d wch_trading -t -c "$sql"
  fi
}

echo -e "${GREEN}Starting smoke test with Correlation ID: $CORRELATION_ID${NC}"

# Check dependencies
for cmd in curl jq uuidgen; do
  if ! command -v $cmd &> /dev/null; then
    echo -e "${RED}Error: $cmd is not installed.${NC}"
    exit 1
  fi
done

# 1. Register User
echo "1. Registering user..."
REGISTER_RES=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: $CORRELATION_ID" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_NAME\"
  }")

TOKEN=$(echo $REGISTER_RES | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Registration failed: $REGISTER_RES${NC}"
  exit 1
fi

echo "User registered successfully."

# 2. Add Exchange Account
echo "2. Adding exchange account..."
ACCOUNT_RES=$(curl -s -X POST "$API_URL/api/v1/exchange-accounts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Correlation-ID: $CORRELATION_ID" \
  -d "{
    \"exchange\": \"binance\",
    \"label\": \"Smoke Test Account\",
    \"api_key\": \"mock_key\",
    \"api_secret\": \"mock_secret\"
  }")

ACCOUNT_ID=$(echo $ACCOUNT_RES | jq -r '.id')
USER_ID=$(echo $ACCOUNT_RES | jq -r '.user_id')

if [ "$ACCOUNT_ID" == "null" ] || [ -z "$ACCOUNT_ID" ]; then
  echo -e "${RED}Failed to add exchange account: $ACCOUNT_RES${NC}"
  exit 1
fi

echo "Exchange account added: $ACCOUNT_ID"

# 3. Create Bot
echo "3. Creating bot..."
BOT_RES=$(curl -s -X POST "$API_URL/api/v1/bots" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Correlation-ID: $CORRELATION_ID" \
  -d "{
    \"name\": \"Smoke Test Bot\",
    \"strategy\": \"trend-breakout\",
    \"symbol\": \"BTC/USDT\",
    \"quote_asset\": \"USDT\",
    \"capital\": 1000,
    \"exchange_account_id\": \"$ACCOUNT_ID\",
    \"risk_settings\": {
      \"max_position_size\": 0.1,
      \"stop_loss_percent\": 2.0,
      \"take_profit_percent\": 5.0
    }
  }")

BOT_ID=$(echo $BOT_RES | jq -r '.bot.id')
if [ "$BOT_ID" == "null" ] || [ -z "$BOT_ID" ]; then
  echo -e "${RED}Failed to create bot: $BOT_RES${NC}"
  exit 1
fi
echo "Bot created: $BOT_ID"

# 4. Activate Bot (Paper)
echo "4. Activating bot in paper mode..."
ACTIVATE_RES=$(curl -s -X POST "$API_URL/api/v1/bots/$BOT_ID/activate-paper" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Correlation-ID: $CORRELATION_ID")

echo "Bot activation response: $(echo $ACTIVATE_RES | jq -r '.message')"

# 5. Inject Order Intent to Redis
echo "5. Injecting order intent to Redis..."
INTENT_ID=$(uuidgen)
INTENT_JSON=$(cat <<EOF
{
  "correlation_id": "$CORRELATION_ID",
  "payload": {
    "id": "$INTENT_ID",
    "bot_id": "$BOT_ID",
    "user_id": "$USER_ID",
    "side": "buy",
    "order_type": "market",
    "quantity": 0.01,
    "price": 60000.0,
    "status": "created",
    "reason": "smoke test",
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
}
EOF
)

# Use docker compose if available, otherwise assume local redis-cli
if command -v docker &> /dev/null && docker compose ps redis | grep -q "Up"; then
  echo "$INTENT_JSON" | docker compose exec -T redis redis-cli -x lpush order_intents > /dev/null
else
  echo "$INTENT_JSON" | redis-cli -x lpush order_intents > /dev/null
fi

echo "Waiting for executor to process (max 15s)..."
for i in {1..15}; do
  ORDER_STATUS=$(query_db "SELECT status FROM orders WHERE order_intent_id = '$INTENT_ID';" | xargs)
  if [ "$ORDER_STATUS" == "filled" ]; then
    echo "Order filled after $i seconds."
    break
  fi
  sleep 1
done

# 6. Verify Postgres
echo "6. Verifying Postgres state..."

INTENT_COUNT=$(query_db "SELECT count(*) FROM order_intents WHERE id = '$INTENT_ID';" | xargs)
echo "Order Intent in DB: $INTENT_COUNT"

ORDER_STATUS=$(query_db "SELECT status FROM orders WHERE order_intent_id = '$INTENT_ID';" | xargs)
echo "Order Status in DB: $ORDER_STATUS"

EXEC_COUNT=$(query_db "SELECT count(*) FROM executions WHERE bot_id = '$BOT_ID';" | xargs)
echo "Execution count for bot in DB: $EXEC_COUNT"

# 7. Verify Metrics
echo "7. Verifying Metrics..."
API_METRICS=$(curl -s http://localhost:8080/metrics | grep "wch_api_bot_lifecycle_events_total{action=\"activate_paper\",status=\"success\"}")
if [ -n "$API_METRICS" ]; then
  echo "API Metrics verified: $API_METRICS"
else
  echo -e "${RED}API Metrics missing!${NC}"
  # Don't exit yet, let's see other results
fi

EXECUTOR_METRICS=$(curl -s http://localhost:9090/metrics | grep "wch_executor_orders_created_total{mode=\"paper\"}")
if [ -n "$EXECUTOR_METRICS" ]; then
  echo "Executor Metrics verified: $EXECUTOR_METRICS"
else
  echo -e "${RED}Executor Metrics missing!${NC}"
fi

# Validation
if [[ "$ORDER_STATUS" == "filled" ]] && [ "$EXEC_COUNT" -gt 0 ]; then
  echo -e "${GREEN}SMOKE TEST SUCCESSFUL${NC}"
else
  echo -e "${RED}SMOKE TEST FAILED${NC}"
  echo "Last 20 lines of executor logs:"
  if command -v docker &> /dev/null; then
    docker compose logs --tail=50 executor-rust | grep "$CORRELATION_ID" || docker compose logs --tail=50 executor-rust
  fi
  exit 1
fi
