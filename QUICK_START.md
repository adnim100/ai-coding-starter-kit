# ProjectHub - Quick Start Guide

## ✅ Current Status

**Everything is already running and ready to use!**

### Services Status
- ✅ **Next.js Dev Server**: Running on http://localhost:3000
- ✅ **Transcription Worker**: Connected to Redis and waiting for jobs
- ✅ **Supabase Database**: Online and operational
- ✅ **Redis Queue**: Upstash Redis connected

---

## 🚀 Getting Started (3 Minutes)

### Step 1: Open the Application

Go to: **http://localhost:3000**

### Step 2: Create Your Account

1. Click "Register" or go to http://localhost:3000/register
2. Fill in:
   - Email address
   - Password (min 8 characters)
   - Confirm password
3. Click "Create Account"

### Step 3: Verify Email

Since we haven't configured email service yet, check the **terminal/console** where the dev server is running. You'll see a verification link like:

```
Email verification link: http://localhost:3000/verify-email?token=abc123...
```

Click or paste this link to verify your email.

### Step 4: Setup Two-Factor Authentication (2FA)

1. After email verification, you'll be redirected to 2FA setup
2. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
3. Enter the 6-digit code from your app
4. **IMPORTANT**: Save your recovery codes in a safe place!
5. Click "Complete Setup"

### Step 5: Login

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Enter the 6-digit code from your authenticator app
4. You're in!

---

## 📋 First Project

### Create a Project

1. From the dashboard, click "New Project"
2. Enter:
   - **Name**: "My First Transcription"
   - **Description**: (optional)
   - **Tags**: (optional, e.g., "test", "demo")
3. Click "Create Project"

### Upload Audio File

1. Open your new project
2. **Drag and drop** an audio file OR click to browse
   - Supported formats: WAV, MP3, M4A, FLAC, OGG, WEBM
   - Max size: 500MB
   - Sample audio: Use any voice recording or podcast
3. Select audio type: Mono or Stereo
4. Wait for upload to complete (you'll see a progress bar)

### Setup Provider API Keys

Before transcribing, you need to add API keys for at least one provider.

1. Go to **Settings** → **API Keys**
2. Add a key for one or more providers:

#### Quick Provider Setup (Pick One to Start)

**Option 1: OpenAI Whisper** (Recommended for beginners)
- Go to https://platform.openai.com/api-keys
- Create new secret key
- Copy and paste into ProjectHub
- Cost: ~$0.006 per minute of audio

**Option 2: Deepgram** (Fast & affordable)
- Go to https://console.deepgram.com/
- Sign up for free (includes $200 credit)
- Copy API key
- Paste into ProjectHub

**Option 3: AssemblyAI** (Great accuracy)
- Go to https://www.assemblyai.com/
- Sign up for free account
- Copy API key from dashboard
- Paste into ProjectHub

### Start Transcription

1. In your project, click **"Transcribe"**
2. Select provider(s) - you can choose up to 9!
   - Start with 1-2 to test
3. Configure options:
   - **Language**: Auto-detect or select specific
   - **Speaker Diarization**: ON (identifies different speakers)
   - **Timestamps**: ON (word-level timing)
4. Click **"Start Transcription"**
5. Jobs are queued and will process in the background

### Monitor Progress

- Dashboard shows real-time status
- Progress bars for each provider
- Estimated time remaining
- You can leave the page and come back later

### View & Compare Results

Once complete (usually 2-10 minutes depending on audio length):

1. Click **"Compare"** in your project
2. Choose view mode:
   - **Side-by-side**: See all transcripts at once
   - **Diff**: Compare two providers with highlighted differences
   - **Table**: View metrics (accuracy, speed, cost)
3. **Play audio**: Click the play button
4. **Jump to timestamp**: Click any segment to jump in audio
5. **Add comments**: Select text and add notes

### Export Results

1. Click **"Export"** button
2. Choose format:
   - **TXT**: Plain text with timestamps
   - **JSON**: Structured data for developers
   - **CSV**: Open in Excel
   - **PDF**: Professional report
3. Or export **Comparison Table** to compare all providers

---

## 🔑 Getting Provider API Keys

### Free Tier Providers (Great for Testing)

1. **Deepgram** - https://console.deepgram.com/
   - Free: $200 credit
   - Fast and accurate
   - Easy setup

2. **AssemblyAI** - https://www.assemblyai.com/
   - Free: Limited minutes per month
   - Great for podcasts
   - Speaker diarization

3. **Gladia** - https://www.gladia.io/
   - Free tier available
   - Good multilingual support

### Paid Providers (Best Quality)

4. **OpenAI Whisper** - https://platform.openai.com/
   - Cost: ~$0.006/minute
   - Excellent accuracy
   - 98 languages

5. **Google Speech-to-Text** - https://cloud.google.com/speech-to-text
   - Free: 60 minutes/month
   - Then ~$0.006/minute
   - Very accurate

6. **AWS Transcribe** - https://aws.amazon.com/transcribe/
   - Free: 60 minutes/month
   - Enterprise-grade
   - HIPAA compliant

### Specialized Providers

7. **ElevenLabs** - https://elevenlabs.io/
   - Best for voice cloning
   - High quality audio

8. **Speechmatics** - https://www.speechmatics.com/
   - Real-time transcription
   - 30+ languages

9. **OpenRouter** - https://openrouter.ai/
   - Access to multiple AI models
   - Flexible pricing

---

## 💡 Tips & Tricks

### Best Practices

1. **Start with 2-3 providers** to compare quality
2. **Use shorter audio clips** for initial testing (1-2 minutes)
3. **Enable speaker diarization** for interviews/conversations
4. **Compare results** - different providers excel at different things
5. **Save your API keys** - they're encrypted and stored securely

### Audio Quality Tips

- Use **WAV or FLAC** for best quality
- **16kHz or 44.1kHz** sample rate recommended
- **Mono audio** is cheaper and often sufficient
- **Clear audio** = better transcription (reduce background noise)

### Cost Optimization

- **Test with free tier** providers first
- **Batch process** multiple files in one project
- **Use Mono** instead of Stereo when possible
- **Compare prices** in the table view before committing

---

## 🐛 Troubleshooting

### "Worker not connected"
- Check if worker is running (see terminal)
- Restart worker: `npx tsx src/workers/transcription-worker.ts`

### "Invalid API key"
- Verify key is correct
- Check provider dashboard for key status
- Some providers have separate test/production keys

### "Upload failed"
- Check file size (max 500MB)
- Verify format (WAV, MP3, M4A, FLAC, OGG, WEBM)
- Try smaller file first

### "Job stuck in queue"
- Check worker logs in terminal
- Verify Redis connection
- Restart worker if needed

### "Can't login"
- Make sure you verified email
- Check 2FA code is current (updates every 30 seconds)
- Use recovery code if 2FA not working

---

## 📱 Recommended Authenticator Apps

For Two-Factor Authentication (2FA):

- **Google Authenticator** - iOS/Android
- **Authy** - iOS/Android/Desktop
- **Microsoft Authenticator** - iOS/Android
- **1Password** - If you use password manager

---

## 🎯 Next Steps

Once you're comfortable with basics:

1. **Try multiple providers** - Compare quality and cost
2. **Test different audio types** - Podcasts, meetings, lectures
3. **Explore comparison views** - Find what works for you
4. **Setup Google OAuth** (optional) - Easier login
5. **Configure email service** (optional) - Automatic notifications

---

## 📞 Need Help?

- **Documentation**: See [COMPLETE_STATUS.md](COMPLETE_STATUS.md) for full feature list
- **Database Setup**: See [DATABASE_SETUP.md](DATABASE_SETUP.md)
- **Redis Setup**: See [REDIS_SETUP.md](REDIS_SETUP.md)
- **General Info**: See [README_PROJECTHUB.md](README_PROJECTHUB.md)

---

## 🌐 Important URLs

- **Application**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/lanadsinyexkwahyphxb
- **Upstash Redis**: https://console.upstash.com/

---

**You're all set! Start transcribing! 🎉**
