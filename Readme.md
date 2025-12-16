# n8n Workflow Popularity System - Backend

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.8 or higher
- YouTube Data API Key (get from Google Cloud Console)

### 2. Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

#### Get YouTube API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

#### Set Environment Variable:
```bash
# Linux/Mac
export YOUTUBE_API_KEY="your_youtube_api_key_here"

# Windows
set YOUTUBE_API_KEY=your_youtube_api_key_here
```

Or create a `.env` file:
```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 4. Run the Application

```bash
# Development mode
python app.py

# Or use uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Test the API

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

## 📡 API Endpoints

### Get All Workflows
```bash
GET /api/workflows
GET /api/workflows?platform=YouTube
GET /api/workflows?country=US
GET /api/workflows?limit=20
```

### Get Workflows by Platform
```bash
GET /api/workflows/platform/YouTube
GET /api/workflows/platform/n8n%20Forum
GET /api/workflows/platform/Google%20Search
```

### Get Workflows by Country
```bash
GET /api/workflows/country/US
GET /api/workflows/country/IN
```

### Trigger Manual Sync
```bash
POST /api/sync
```

### Get Statistics
```bash
GET /api/stats
```

## 🔧 Configuration

### Cron Schedule
The system automatically syncs data daily at 2:00 AM. To change this:

Edit `app.py` line with `scheduler.add_job`:
```python
scheduler.add_job(
    collect_all_workflows,
    'cron',
    hour=2,  # Change hour (0-23)
    minute=0,  # Change minute (0-59)
    id='daily_workflow_sync'
)
```

### Rate Limiting
YouTube API has quota limits (10,000 units/day by default). The code includes:
- Sleep delays between requests (`await asyncio.sleep(0.5)`)
- Limited keyword searches (15 keywords)
- Limited results per query (5 videos)

Adjust these in `app.py` if needed.

## 🚀 Deployment to Render

### 1. Create `render.yaml` (optional)
```yaml
services:
  - type: web
    name: n8n-popularity-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: YOUTUBE_API_KEY
        sync: false
```

### 2. Deploy Steps:
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: n8n-popularity-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variable:
   - Key: `YOUTUBE_API_KEY`
   - Value: Your YouTube API key
7. Click "Create Web Service"

### 3. Access Your API:
Your API will be available at: `https://your-service-name.onrender.com`

## 🧪 Testing

### Test with curl:
```bash
# Get all workflows
curl http://localhost:8000/api/workflows

# Get YouTube workflows only
curl http://localhost:8000/api/workflows/platform/YouTube

# Get statistics
curl http://localhost:8000/api/stats

# Trigger sync
curl -X POST http://localhost:8000/api/sync
```

### Test with Python:
```python
import requests

# Get workflows
response = requests.get("http://localhost:8000/api/workflows?limit=10")
print(response.json())

# Get stats
response = requests.get("http://localhost:8000/api/stats")
print(response.json())
```

## 📊 Data Sources

1. **YouTube Data API v3**: Video statistics, engagement metrics
2. **n8n Community Forum (Discourse API)**: Topic discussions, community engagement
3. **Search Trends**: Simulated search volume data (replace with Google Trends API in production)

## 🔒 Security Notes

- Never commit API keys to Git
- Use environment variables for sensitive data
- Enable CORS only for trusted domains in production
- Implement rate limiting for API endpoints
- Use authentication for write operations

## 📝 Notes

- The system caches data in memory (use Redis or database for production)
- YouTube API quotas apply (10,000 units/day default)
- Forum API is public but respect rate limits
- Initial data collection takes 2-5 minutes

## 🐛 Troubleshooting

### YouTube API Quota Exceeded:
- Wait 24 hours for quota reset
- Request quota increase from Google Cloud Console
- Reduce number of keywords searched

### No Data Returned:
- Check if API keys are set correctly
- Verify internet connection
- Check API endpoint status
- Trigger manual sync: `POST /api/sync`

### Port Already in Use:
```bash
# Change port
uvicorn app:app --port 8001
```