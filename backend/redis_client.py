import redis.asyncio as redis
import os

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

redis_client: redis.Redis = None

async def get_redis_client() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.Redis(
            host=REDIS_HOST, 
            port=REDIS_PORT, 
            decode_responses=True
        )
    return redis_client

async def close_redis_client():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None

LUA_UPLOAD_SCRIPT = """
local user_key = KEYS[1]
local global_key = KEYS[2]
local max_user = tonumber(ARGV[1])
local max_global = tonumber(ARGV[2])
local current_time = tonumber(ARGV[3])
local window_ms = 86400000
local cutoff_time = current_time - window_ms

local function clean_and_check(key, max_limit)
    local removed = redis.call('ZREMRANGEBYSCORE', key, 0, cutoff_time)
    local count = redis.call('ZCARD', key)
    
    if count >= max_limit then
        return { error = key .. "_LIMIT_EXCEEDED", count = count, cleaned = removed }
    end
    return { count = count, cleaned = removed }
end

local user_status = clean_and_check(user_key, max_user)
if user_status.error then
    return user_status.error
end

local global_status = clean_and_check(global_key, max_global)
if global_status.error then
    return global_status.error
end

redis.call('ZADD', user_key, current_time, current_time)

local global_member = current_time .. ":" .. user_key
redis.call('ZADD', global_key, current_time, global_member)

if user_status.cleaned > 0 then
    local oldest_user = redis.call('ZRANGE', user_key, 0, 0, 'WITHSCORES')
    if #oldest_user > 0 then
        local oldest_timestamp = tonumber(oldest_user[2])
        local ttl_seconds = math.ceil((oldest_timestamp + window_ms - current_time) / 1000)
        if ttl_seconds > 0 then
            redis.call('EXPIRE', user_key, ttl_seconds)
        end
    end
end

if global_status.cleaned > 0 then
    redis.call('EXPIRE', global_key, 90000)
end

return "OK"
"""

