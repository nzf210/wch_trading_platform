# Redis Scheme

## Streams

- stream:signals
- stream:executions
- stream:bot-events
- stream:notifications

## Cache

- price:{exchange}:{symbol}
- candle:{exchange}:{symbol}:{interval}
- user:{user_id}:subscription
- bot:{bot_id}:config
- bot:{bot_id}:state

## Locks

- lock:bot:{bot_id}:execution
- lock:user:{user_id}:risk
- lock:order:{idempotency_key}
