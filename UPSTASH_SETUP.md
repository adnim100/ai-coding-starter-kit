# Upstash Redis Setup for BullMQ

## Important: Get the Correct Redis URL

The credentials you provided are for **Upstash REST API**, but BullMQ needs the **standard Redis connection**.

### Steps to Get the Correct URL:

1. Go to your Upstash dashboard: https://console.upstash.com/
2. Click on your Redis database: `deep-ladybug-40977`
3. Look for **"Redis Connect"** section
4. Copy the **"Redis URL"** (not REST URL) - it should look like:
   ```
   rediss://default:YOUR_PASSWORD@deep-ladybug-40977.upstash.io:6379
   ```

### Update .env.local:

Replace the current REDIS_URL with the **Redis URL** (starts with `redis://` or `rediss://`):

```env
# Redis (for BullMQ) - Use the Redis URL, NOT the REST URL
REDIS_URL="rediss://default:YOUR_PASSWORD@deep-ladybug-40977.upstash.io:6379"
```

### Current Issue:

You provided:
- ❌ REST URL: `https://deep-ladybug-40977.upstash.io` (for HTTP API)
- ❌ REST Token: For REST API only

We need:
- ✅ Redis URL: `rediss://default:PASSWORD@deep-ladybug-40977.upstash.io:6379` (for BullMQ)

### Where to Find It:

In your Upstash console, you should see multiple connection strings:
1. **Redis URL** ← We need this one for BullMQ
2. REST URL ← You already have this
3. REST Token ← You already have this

### After Updating:

1. Update `REDIS_URL` in `.env.local` with the correct Redis URL
2. Restart the worker:
   ```bash
   npx tsx src/workers/transcription-worker.ts
   ```

The worker will then connect successfully to Upstash Redis!

---

**Note:** The REST API credentials you provided are still useful for direct HTTP calls to Redis, but BullMQ specifically needs the standard Redis protocol connection.
