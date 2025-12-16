# 🚀 Quick Start Guide - 10 Minutes to Running System

Get the n8n Workflow Popularity System up and running in 10 minutes!

---

## ⏱️ Step 1: Get YouTube API Key (3 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Copy your API key

**Your API Key looks like**: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

## 💻 Step 2: Setup Backend (3 minutes)

```bash
# 1. Create backend folder and files
mkdir n8n-popularity-backend
cd n8n-popularity-backend

# 2. Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.109.0
uvicorn[standard]==0.27.0
httpx==0.26.0
pydantic==2.5.3
python-multipart==0.0.6
APScheduler==3.10.4
python-dotenv==1.0.0
EOF

# 3. Download app.py from artifacts (copy the backend code I provided)
# Save as app.py

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set API key
export YOUTUBE_API_KEY="your_api_key_here"

# 6. Run backend
python app.py
```

**Backend running at**: `http://localhost:8000` ✅

Test it:
```bash
curl http://localhost:8000/api/stats
```

---

## 🎨 Step 3: Setup Frontend (2 minutes)

```bash
# 1. Create frontend folder
mkdir n8n-popularity-frontend
cd n8n-popularity-frontend

# 2. Create index.html (copy the frontend code I provided)
# Save as index.html

# 3. Update API URL in index.html (line ~140)
# Change: const API_BASE_URL = 'http://localhost:8000';

# 4. Run frontend
python -m http.server 3000
```

**Frontend running at**: `http://localhost:3000` ✅

---

## ✅ Step 4: Verify Everything Works (2 minutes)

### Check Backend:

1. Open: `http://localhost:8000/docs`
2. Try "GET /api/workflows" endpoint
3. Should see list of workflows

### Check Frontend:

1. Open: `http://localhost:3000`
2. Should see dashboard with statistics
3. Click "Sync Now" button
4. Wait 10 seconds, data should load

### Quick Tests:

```bash
# Test 1: Get workflows
curl http://localhost:8000/api/workflows | python -m json.tool

# Test 2: Get stats
curl http://localhost:8000/api/stats | python -m json.tool

# Test 3: Trigger sync
curl -X POST http://localhost:8000/api/sync
```

---

## 🎯 What You Should See

### Backend Terminal:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Starting n8n Workflow Popularity API...
INFO:     Collecting workflows for US...
INFO:     Collected 42 YouTube workflows for US
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend Browser:
- 📊 Statistics cards showing workflow counts
- 🔥 Top workflows list
- 🎨 Dark theme UI with purple accents
- 🔍 Working search and filters

---

## 🐛 Troubleshooting

### Backend won't start:

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Problem**: `YouTube API key not set`
```bash
# Solution: Set environment variable
export YOUTUBE_API_KEY="your_key_here"

# Or on Windows:
set YOUTUBE_API_KEY=your_key_here
```

**Problem**: `Port 8000 already in use`
```bash
# Solution: Change port
uvicorn app:app --port 8001
```

### Frontend shows no data:

**Problem**: API URL incorrect
```javascript
// Edit index.html line ~140
const API_BASE_URL = 'http://localhost:8000'; // Make sure this matches backend
```

**Problem**: CORS errors in browser console
```python
# Backend is already configured for CORS
# If issues persist, restart backend after changing CORS settings
```

### No workflows returned:

**Problem**: YouTube API quota exceeded
```
Solution: Wait 24 hours for quota reset
Or reduce keywords searched in app.py
```

**Problem**: YouTube API key invalid
```
Solution: Generate new key from Google Cloud Console
Make sure YouTube Data API v3 is enabled
```

---

## 🎉 Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] API documentation accessible at `/docs`
- [ ] Dashboard loads with statistics
- [ ] Workflow list displays
- [ ] Filters work (platform, country)
- [ ] Search works
- [ ] "Sync Now" button triggers update
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## 📝 Next Steps

### 1. Explore the Dashboard
- Try different filters
- Search for specific workflows
- Click "View Source" links
- Sort by different metrics

### 2. Explore the API
- Visit: `http://localhost:8000/docs`
- Try different endpoints
- Check response formats
- Test with curl/Postman

### 3. Customize
- Change sync schedule (app.py line with scheduler.add_job)
- Add more keywords (app.py N8N_WORKFLOW_KEYWORDS)
- Modify UI colors (index.html style section)
- Add more filters

### 4. Deploy
- Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to Render
- Get your app live on the internet
- Share with the team!

### 5. Integrate with n8n
- Follow [N8N_INTEGRATION.md](N8N_INTEGRATION.md)
- Create automated workflows
- Set up notifications
- Export to Google Sheets

---

## 📚 Documentation

Now that everything is running, read:

1. **[README.md](README.md)** - Project overview
2. **[APPROACH.md](APPROACH.md)** - Technical details
3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to production
4. **[N8N_INTEGRATION.md](N8N_INTEGRATION.md)** - Automate with n8n

---

## 🆘 Still Stuck?

### Common Issues:

1. **Python version**: Make sure you have Python 3.8+
   ```bash
   python --version  # Should be 3.8 or higher
   ```

2. **Pip not found**:
   ```bash
   python -m pip install -r requirements.txt
   ```

3. **Port conflicts**: Change ports if needed
   ```bash
   # Backend
   uvicorn app:app --port 8001
   
   # Frontend
   python -m http.server 3001
   ```

4. **Environment variables not working**:
   ```bash
   # Create .env file
   echo "YOUTUBE_API_KEY=your_key_here" > .env
   
   # Install python-dotenv
   pip install python-dotenv
   ```

### Get Help:

- Check error messages carefully
- Search the error in Google
- Check backend terminal logs
- Check browser console (F12)
- Review documentation files

---

## ⚡ Ultra Quick Start (If you're experienced)

```bash
# Backend
pip install fastapi uvicorn httpx pydantic apscheduler python-dotenv
export YOUTUBE_API_KEY="your_key"
python app.py

# Frontend (new terminal)
cd frontend
python -m http.server 3000

# Open http://localhost:3000
```

---

## 🎯 Goal Achievement

By the end of this quick start, you should have:

✅ Working backend API
✅ Working frontend dashboard
✅ 50+ workflows collected
✅ Real-time data from 3 sources
✅ Beautiful dark UI
✅ Automated cron job
✅ Full documentation
✅ Ready to deploy

**Time taken**: ~10 minutes ⏱️

---

## 🚀 Ready to Deploy?

Now that it works locally, deploy to production:

1. Push code to GitHub
2. Deploy backend to Render
3. Deploy frontend to Render
4. Update API URL in frontend
5. Share your live dashboard!

**Full deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

<div align="center">

**🎉 Congratulations! Your system is running!**

Now explore, customize, and deploy!

</div>