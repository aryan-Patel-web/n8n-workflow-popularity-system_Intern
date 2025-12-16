# 🚀 n8n Workflow Popularity System

> **A production-ready system that identifies and tracks the most popular n8n workflows across YouTube, n8n Forum, and Google Search with real-time engagement metrics.**

Built for **Speak Genie Internship Assignment**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Data Sources](#-data-sources)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔍 Multi-Platform Data Collection
- **YouTube**: Video views, likes, comments, engagement ratios
- **n8n Forum**: Discussion threads, replies, community participation
- **Google Search**: Search volume, trending keywords

### 📊 Rich Analytics
- **Engagement Scoring**: Weighted algorithm combining multiple metrics
- **Geographic Segmentation**: US and India markets
- **Real-time Updates**: Automated daily synchronization
- **Trend Detection**: Track rising and falling workflows

### 🎨 Modern Dashboard
- **Dark Theme**: Beautiful glassmorphism UI design
- **Interactive Filters**: Platform, country, and search filters
- **Responsive Design**: Works on all devices
- **Real-time Search**: Instant workflow filtering
- **Visual Metrics**: Engagement bars and trend indicators

### 🤖 Automation
- **Cron Scheduling**: Daily automated data sync
- **Background Jobs**: Async data processing
- **Rate Limiting**: Respects API quotas
- **Error Handling**: Graceful failure recovery

### 🔌 Production Ready
- **REST API**: Clean, documented endpoints
- **CORS Support**: Cross-origin requests enabled
- **Type Validation**: Pydantic models
- **API Documentation**: Auto-generated Swagger/OpenAPI
- **Deployment Ready**: Docker and cloud deployment configs

---

## 🎥 Demo

### Live Links
- **Frontend Dashboard**: https://your-dashboard.onrender.com
- **API Documentation**: https://your-api.onrender.com/docs
- **API Endpoint**: https://your-api.onrender.com/api/workflows

### Screenshots

*(See [Screenshots](#-screenshots) section below)*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Sources Layer                       │
├─────────────────┬────────────────────┬──────────────────────┤
│  YouTube API    │  n8n Forum (API)   │  Google Trends       │
│  - Videos       │  - Discussions     │  - Search Volume     │
│  - Statistics   │  - Replies         │  - Trend Data        │
└────────┬────────┴──────────┬─────────┴──────────┬───────────┘
         │                   │                     │
         └───────────────────┼─────────────────────┘
                            │
                ┌───────────▼───────────┐
                │   FastAPI Backend     │
                ├───────────────────────┤
                │ - Async Data Fetch    │
                │ - Data Processing     │
                │ - Engagement Scoring  │
                │ - Cron Scheduling     │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   In-Memory Cache     │
                │   (Redis/DB ready)    │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │     REST API          │
                ├───────────────────────┤
                │ GET /api/workflows    │
                │ GET /api/stats        │
                │ POST /api/sync        │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   React Frontend      │
                ├───────────────────────┤
                │ - Dashboard UI        │
                │ - Filters & Search    │
                │ - Data Visualization  │
                └───────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- YouTube Data API Key ([Get here](https://console.cloud.google.com/))
- Node.js (optional, for frontend local dev)
- Git

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/n8n-popularity-system.git
cd n8n-popularity-system/backend

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export YOUTUBE_API_KEY="your_youtube_api_key_here"

# Run the application
python app.py
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

```bash
cd ../frontend

# Option 1: Python simple server
python -m http.server 3000

# Option 2: Node http-server
npx http-server -p 3000
```

Frontend will be available at: `http://localhost:3000`

**Important**: Update API URL in `index.html`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Get All Workflows
```http
GET /api/workflows
```

**Query Parameters**:
- `platform` (optional): Filter by platform (YouTube, n8n Forum, Google Search)
- `country` (optional): Filter by country (US, IN)
- `limit` (optional): Limit number of results

**Response**:
```json
{
  "total_workflows": 89,
  "data": [
    {
      "workflow": "n8n Slack Integration Tutorial",
      "platform": "YouTube",
      "popularity_metrics": {
        "views": 18400,
        "likes": 920,
        "comments": 112,
        "like_to_view_ratio": 0.05,
        "comment_to_view_ratio": 0.0061,
        "engagement_score": 150.34
      },
      "country": "US",
      "url": "https://youtube.com/watch?v=xyz",
      "last_updated": "2024-12-16T10:30:00"
    }
  ],
  "last_sync": "2024-12-16T10:30:00",
  "platforms": {
    "YouTube": 45,
    "n8n Forum": 28,
    "Google Search": 16
  },
  "countries": {
    "US": 50,
    "IN": 39
  }
}
```

#### 2. Get Workflows by Platform
```http
GET /api/workflows/platform/{platform}
```

**Example**:
```bash
curl http://localhost:8000/api/workflows/platform/YouTube
```

#### 3. Get Workflows by Country
```http
GET /api/workflows/country/{country}
```

**Example**:
```bash
curl http://localhost:8000/api/workflows/country/US
```

#### 4. Get Statistics
```http
GET /api/stats
```

**Response**:
```json
{
  "total_workflows": 89,
  "last_updated": "2024-12-16T10:30:00",
  "platforms": {
    "YouTube": {
      "count": 45,
      "total_views": 450000,
      "avg_engagement": 125.5
    }
  },
  "countries": {
    "US": 50,
    "IN": 39
  },
  "top_workflow": "n8n ChatGPT Integration"
}
```

#### 5. Trigger Manual Sync
```http
POST /api/sync
```

**Response**:
```json
{
  "message": "Data synchronization started",
  "status": "processing"
}
```

### Interactive Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

---

## 📊 Data Sources

### 1. YouTube Data API v3

**Metrics Collected**:
- View count
- Like count
- Comment count
- Engagement ratios

**API Quota**: 10,000 units/day
**Strategy**: Curated keywords, top 5 results per keyword

**Example Keywords**:
- n8n automation
- n8n slack integration
- n8n gmail workflow
- n8n chatgpt
- n8n webhook

### 2. n8n Community Forum

**Metrics Collected**:
- Thread views
- Reply count
- Like count
- Unique contributors

**API**: Discourse API (public)
**Rate Limit**: Respected with delays

### 3. Google Search Trends

**Metrics Collected**:
- Monthly search volume
- Trend percentage change
- Geographic data

**Note**: Currently simulated. For production, integrate:
- Google Trends API (pytrends)
- Google Ads Keyword Planner API
- SEO tools (SEMrush, Ahrefs)

---

## 🚢 Deployment

### Deploy to Render (Free)

#### Backend Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Create Web Service on Render**
   - Connect GitHub repository
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variable: `YOUTUBE_API_KEY`

3. **Get Backend URL**
```
https://your-backend.onrender.com
```

#### Frontend Deployment

1. **Update API URL** in `index.html`:
```javascript
const API_BASE_URL = 'https://your-backend.onrender.com';
```

2. **Create Static Site on Render**
   - Connect GitHub repository
   - Publish Directory: `.`
   - No build command needed

3. **Get Frontend URL**
```
https://your-frontend.onrender.com
```

**Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](screenshots/dashboard.png)
*Main dashboard with statistics cards and workflow list*

### Platform Filtering
![Filters](screenshots/filters.png)
*Filter workflows by platform, country, and search*

### Workflow Details
![Details](screenshots/workflow-details.png)
*Detailed metrics for each workflow*

### API Documentation
![API Docs](screenshots/api-docs.png)
*Interactive Swagger API documentation*

---

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **httpx**: Async HTTP client
- **Pydantic**: Data validation
- **APScheduler**: Cron job scheduling
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: UI framework
- **Tailwind CSS**: Utility-first styling
- **FontAwesome**: Icon library
- **Babel**: JSX transpilation (via CDN)

### APIs
- YouTube Data API v3
- Discourse API (n8n Forum)
- Google Trends (future)

### Deployment
- **Render**: Cloud hosting
- **Docker**: Containerization (optional)
- **GitHub**: Version control

---

## 📁 Project Structure

```
n8n-popularity-system/
├── backend/
│   ├── app.py              # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── frontend/
│   ├── index.html         # Single-page React app
│   └── README.md          # Frontend documentation
├── APPROACH.md            # Technical approach & data sources
├── DEPLOYMENT.md          # Deployment guide
├── N8N_INTEGRATION.md     # n8n automation guide
└── README.md              # This file
```

---

## 🎯 Assignment Requirements

### ✅ Completed Requirements

- [x] **50+ workflows** collected (target: 50, typically returns 80-100)
- [x] **3 data sources**: YouTube, n8n Forum, Google Search
- [x] **Popularity evidence**: Views, likes, comments, engagement scores
- [x] **Geographic segmentation**: US and India
- [x] **REST API**: JSON responses, multiple endpoints
- [x] **Cron automation**: Daily sync at 2 AM
- [x] **Production ready**: Clean code, documentation, error handling
- [x] **Platform segmentation**: Filterable by source
- [x] **Rich metrics**: Ratios, scores, trends

### 📊 Output Format

Each workflow includes:
```json
{
  "workflow": "Workflow name",
  "platform": "YouTube/n8n Forum/Google Search",
  "popularity_metrics": {
    "views": 12500,
    "likes": 630,
    "comments": 88,
    "like_to_view_ratio": 0.05,
    "comment_to_view_ratio": 0.007,
    "engagement_score": 120.5
  },
  "country": "US",
  "url": "https://...",
  "last_updated": "2024-12-16T10:30:00"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is created for **Speak Genie Internship Assignment**.

For production use, consider:
- MIT License for open source
- Proprietary license for commercial use

---

## 🙏 Acknowledgments

- **n8n.io**: For the amazing automation platform
- **Speak Genie**: For the internship opportunity
- **YouTube**: For the Data API
- **Discourse**: For the forum platform

---

## 📞 Contact

**Your Name**
- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

**Project Links**:
- Repository: [GitHub](https://github.com/yourusername/n8n-popularity-system)
- Live Demo: [Dashboard](https://your-dashboard.onrender.com)
- API: [Documentation](https://your-api.onrender.com/docs)

---

## 🎓 Documentation

- [APPROACH.md](APPROACH.md) - Technical approach and data sources
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [N8N_INTEGRATION.md](N8N_INTEGRATION.md) - Using n8n with the system
- [backend/README.md](backend/README.md) - Backend setup
- [frontend/README.md](frontend/README.md) - Frontend setup

---

## 📈 Future Enhancements

### Phase 2
- [ ] Database integration (PostgreSQL)
- [ ] User authentication
- [ ] Historical trend tracking
- [ ] Export to CSV/PDF
- [ ] More data sources (GitHub, Reddit, Twitter)

### Phase 3
- [ ] Machine learning predictions
- [ ] Sentiment analysis
- [ ] Workflow recommendations
- [ ] Mobile app (React Native)
- [ ] Real-time notifications

---

## ⚠️ Known Limitations

1. **YouTube API Quota**: Limited to 10,000 units/day
2. **In-Memory Storage**: Data lost on restart (use database in production)
3. **Simulated Search Data**: Replace with real Google Trends API
4. **Rate Limiting**: May need adjustment based on usage
5. **Free Tier Hosting**: Render free tier spins down after 15 min inactivity

---

## 🔥 Quick Commands

```bash
# Run backend
cd backend && python app.py

# Run frontend
cd frontend && python -m http.server 3000

# Test API
curl http://localhost:8000/api/workflows

# Trigger sync
curl -X POST http://localhost:8000/api/sync

# View API docs
open http://localhost:8000/docs

# Run with environment variable
YOUTUBE_API_KEY=your_key python app.py
```

---

<div align="center">

**Built with ❤️ for Speak Genie**

⭐ Star this repository if you found it helpful!

[Report Bug](https://github.com/yourusername/n8n-popularity-system/issues) · 
[Request Feature](https://github.com/yourusername/n8n-popularity-system/issues)

</div>