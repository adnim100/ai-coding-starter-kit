# Redis Setup for ProjectHub

The worker needs Redis for the queue system. You have 3 options:

## Option 1: Upstash (Recommended - Free & Cloud)

**Easiest and works immediately!**

1. Go to https://upstash.com/
2. Sign up (free account)
3. Create a new Redis database
4. Copy the Redis URL
5. Update `.env.local`:
   ```
   REDIS_URL="rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379"
   ```
6. Restart the worker - it will connect automatically!

**Pros:**
- ✅ No installation needed
- ✅ Free tier (10,000 commands/day)
- ✅ Works from anywhere
- ✅ Production-ready

## Option 2: Install Redis on Windows

### Using Chocolatey:
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Redis
choco install redis-64 -y

# Start Redis
redis-server
```

### Using WSL2:
```bash
# In WSL2 terminal
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

## Option 3: Docker Desktop (If Installed)

Install Docker Desktop from https://www.docker.com/products/docker-desktop/

Then run:
```bash
docker run -d --name projecthub-redis -p 6379:6379 redis:alpine
```

## Quick Test (After Setup)

Test Redis connection:
```bash
# If using local Redis
redis-cli ping
# Should return: PONG

# If using Upstash
# Just restart the worker - it will connect automatically
```

## Current Status

The worker is trying to connect to Redis at `localhost:6379` but it's not running.

**Recommended Next Steps:**
1. Use Upstash (takes 2 minutes to setup)
2. Or install Redis locally (takes 5-10 minutes)
3. Update REDIS_URL in `.env.local`
4. Restart the worker

The rest of the application works fine - you just need Redis for the background job processing!
