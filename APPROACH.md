# n8n Workflow Popularity System - Technical Approach

## 📋 Executive Summary

This system identifies and tracks the most popular n8n workflows across multiple platforms using real-time data aggregation, engagement metrics, and automated synchronization. The solution delivers production-ready API endpoints with rich, evidence-based popularity metrics.

---

## 🎯 Project Objectives

1. **Aggregate workflows** from 3+ data sources (YouTube, n8n Forum, Google Search)
2. **Calculate popularity metrics** with clear evidence (views, likes, engagement ratios)
3. **Segment by geography** (US and India)
4. **Provide REST API** with JSON responses
5. **Automate data collection** via cron scheduling
6. **Deliver 50+ workflows** with verifiable popularity signals

---

## 🏗️ System Architecture

### Architecture Overview

```
┌─────────────────┐
│   Data Sources  │
├─────────────────┤
│ - YouTube API   │
│ - n8n Forum API │
│ - Search Trends │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Collector │
│   (FastAPI)     │
├─────────────────┤
│ - Async fetch   │
│ - Rate limiting │
│ - Data cleaning │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Storage   │
│  (In-Memory)    │
├─────────────────┤
│ - Cache layer   │
│ - JSON format   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   REST API      │
├─────────────────┤
│ - GET workflows │
│ - Filter/Search │
│ - Statistics    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend UI   │
│   (React)       │
├─────────────────┤
│ - Dashboard     │
│ - Filters       │
│ - Visualizations│
└─────────────────┘
```

### Technology Stack

**Backend:**
- **FastAPI**: Modern, fast Python web framework
- **httpx**: Async HTTP client for API calls
- **APScheduler**: Cron job scheduling
- **Pydantic**: Data validation and modeling

**Frontend:**
- **React 18**: UI library
- **Tailwind CSS**: Utility-first styling
- **FontAwesome**: Icon library

**Deployment:**
- **Render**: Cloud hosting platform
- **Static CDN**: Frontend asset delivery

---

## 📊 Data Sources & Collection Strategy

### 1. YouTube Data API v3

**Purpose**: Identify popular n8n tutorial videos and workflow demonstrations

**API Endpoint**: `https://www.googleapis.com/youtube/v3/`

**Collection Process**:
1. Search for n8n-related keywords (30 curated keywords)
2. Filter by relevance and view count
3. Fetch detailed video statistics
4. Calculate engagement metrics

**Metrics Collected**:
- **View Count**: Total video views
- **Like Count**: Number of likes
- **Comment Count**: Number of comments
- **Like-to-View Ratio**: `likes / views`
- **Comment-to-View Ratio**: `comments / views`
- **Engagement Score**: Weighted combination of metrics

**Example Keywords**:
- "n8n automation"
- "n8n slack integration"
- "n8n gmail workflow"
- "n8n chatgpt automation"
- "n8n webhook tutorial"

**Rate Limiting**:
- YouTube API quota: 10,000 units/day
- Search query: 100 units
- Video details: 1 unit per video
- Strategy: Batch requests, cache results, limit to top 5 per keyword

**Evidence Quality**:
- ✅ High: Videos with 1000+ views
- ✅ Medium: Videos with 100-1000 views
- ❌ Low: Videos with <100 views (filtered out)

**Sample Output**:
```json
{
  "workflow": "Automate Gmail with n8n and Google Sheets",
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
  "url": "https://youtube.com/watch?v=abc123"
}
```

---

### 2. n8n Community Forum (Discourse API)

**Purpose**: Track popular workflow discussions and community engagement

**API Endpoint**: `https://community.n8n.io/`

**Collection Process**:
1. Fetch top topics from forum (all-time)
2. Get detailed topic information
3. Count unique contributors
4. Calculate engagement metrics

**Metrics Collected**:
- **View Count**: Topic views
- **Like Count**: Post likes
- **Reply Count**: Number of replies
- **Contributor Count**: Unique participants
- **Engagement Score**: Weighted combination

**API Calls**:
```python
# Get top topics
GET /top.json?period=all

# Get topic details
GET /t/{topic_id}.json
```

**Rate Limiting**:
- Discourse API: Rate limited per IP
- Strategy: Sleep 0.3s between requests, limit to top 30 topics

**Evidence Quality**:
- ✅ High: Topics with 500+ views and 10+ replies
- ✅ Medium: Topics with 50-500 views
- ❌ Low: Topics with <50 views (filtered out)

**Sample Output**:
```json
{
  "workflow": "WhatsApp Reminder Automation with n8n",
  "platform": "n8n Forum",
  "popularity_metrics": {
    "views": 2500,
    "likes": 37,
    "replies": 48,
    "contributors": 22,
    "engagement_score": 95.8
  },
  "country": "US",
  "url": "https://community.n8n.io/t/whatsapp-reminders/12345"
}
```

---

### 3. Google Search Trends

**Purpose**: Identify trending n8n workflow topics based on search interest

**Data Source**: Simulated search volume (production: Google Trends API / Google Ads API)

**Collection Process**:
1. Curated list of high-intent n8n keywords
2. Simulate search volume and trend data
3. Calculate trend momentum

**Metrics Collected**:
- **Search Volume**: Monthly searches
- **Trend Change**: % increase/decrease (60-day window)
- **Engagement Score**: Volume × trend factor

**Production Implementation**:
For production, replace simulated data with:

**Option A - Google Trends (pytrends)**:
```python
from pytrends.request import TrendReq

pytrend = TrendReq()
pytrend.build_payload(['n8n slack integration'])
data = pytrend.interest_over_time()
```

**Option B - Google Ads Keyword Planner API**:
- Requires Google Ads account
- Provides exact search volumes
- Better for commercial analysis

**Evidence Quality**:
- ✅ High: 1000+ monthly searches, +20% trend
- ✅ Medium: 500-1000 searches
- ⚠️ Simulated: Current implementation (replace in production)

**Sample Output**:
```json
{
  "workflow": "n8n Slack integration",
  "platform": "Google Search",
  "popularity_metrics": {
    "search_volume": 3600,
    "trend_change": 42.5,
    "engagement_score": 5130
  },
  "country": "US"
}
```

---

## 🧮 Engagement Score Calculation

### Formula

```python
engagement_score = ((likes × 2) + (comments × 3) + (replies × 3)) / views × 1000
```

### Rationale

- **Likes** weighted 2x: Indicates approval
- **Comments** weighted 3x: Higher engagement signal
- **Replies** weighted 3x: Active community discussion
- **Normalized by views**: Accounts for reach
- **Multiplied by 1000**: Human-readable scale

### Score Interpretation

- **200+**: Viral/Highly engaging
- **100-200**: Very popular
- **50-100**: Popular
- **10-50**: Moderate engagement
- **<10**: Low engagement

---

## 🌍 Geographic Segmentation

### Countries Targeted

1. **United States (US)**
   - Primary market for n8n
   - Large automation community
   - High-quality YouTube content

2. **India (IN)**
   - Growing n8n adoption
   - Active developer community
   - Cost-effective automation focus

### Implementation

**YouTube**: Uses `regionCode` parameter in API
```python
search_params = {
    "regionCode": "US",  # or "IN"
    ...
}
```

**Forum**: Geographic-agnostic, assigned based on data collection run

**Search Trends**: Segmented by country in trend data

---

## 🤖 Automation & Scheduling

### Cron Job Configuration

**Framework**: APScheduler (Advanced Python Scheduler)

**Schedule**: Daily at 2:00 AM (configurable)

**Implementation**:
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(
    collect_all_workflows,
    'cron',
    hour=2,
    minute=0,
    id='daily_workflow_sync'
)
scheduler.start()
```

**Execution Flow**:
1. Trigger at scheduled time
2. Collect YouTube workflows (US & IN)
3. Collect Forum workflows
4. Collect Search trend workflows
5. Calculate engagement scores
6. Sort by popularity
7. Update cache
8. Log completion

**Manual Trigger**: Available via `/api/sync` endpoint

---

## 🔒 Rate Limiting & Best Practices

### YouTube API
- **Quota**: 10,000 units/day
- **Strategy**: 
  - Limit keywords to 15
  - Max 5 videos per keyword
  - Cache results for 24 hours
  - Sleep 0.5s between requests

### n8n Forum API
- **Limit**: Rate limited per IP
- **Strategy**:
  - Sleep 0.3s between topic requests
  - Limit to top 30 topics
  - Respect HTTP 429 responses

### Error Handling
- Try-catch on all API calls
- Log errors without crashing
- Continue with partial data on failure
- Graceful degradation

---

## 📦 Data Models

### WorkflowData Schema

```python
class WorkflowData(BaseModel):
    workflow: str                      # Workflow name/title
    platform: str                      # Source platform
    popularity_metrics: PopularityMetrics
    country: str                       # US or IN
    url: Optional[str]                 # Source URL
    last_updated: str                  # ISO 8601 timestamp
```

### PopularityMetrics Schema

```python
class PopularityMetrics(BaseModel):
    views: Optional[int] = 0
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    replies: Optional[int] = 0
    contributors: Optional[int] = 0
    like_to_view_ratio: Optional[float] = 0.0
    comment_to_view_ratio: Optional[float] = 0.0
    engagement_score: Optional[float] = 0.0
    search_volume: Optional[int] = 0
    trend_change: Optional[float] = 0.0
```

---

## 🚀 Production Readiness Checklist

### ✅ Completed

- [x] RESTful API with multiple endpoints
- [x] Async data collection
- [x] Error handling and logging
- [x] Rate limiting implementation
- [x] Data validation with Pydantic
- [x] CORS configuration
- [x] Automated scheduling (cron)
- [x] API documentation (Swagger/OpenAPI)
- [x] Response caching
- [x] Deployment-ready code

### 🔄 Production Enhancements

For production deployment, consider:

1. **Database Integration**
   - Replace in-memory cache with PostgreSQL/MongoDB
   - Implement data persistence
   - Add historical tracking

2. **Authentication**
   - API key authentication
   - Rate limiting per user
   - Admin endpoints protection

3. **Monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking (Sentry)
   - Usage analytics

4. **Scaling**
   - Redis cache layer
   - Background job queue (Celery)
   - Load balancing

5. **Real Search Data**
   - Integrate Google Trends API
   - Add Google Ads Keyword Planner
   - Implement SEO tool APIs (SEMrush, Ahrefs)

---

## 📈 Expected Results

### Workflow Count
- **Target**: 50+ workflows
- **Expected Distribution**:
  - YouTube: 40-60 workflows
  - n8n Forum: 20-30 workflows
  - Google Search: 15-20 workflows

### Data Quality
- All workflows have verifiable popularity evidence
- Engagement scores accurately reflect community interest
- Geographic segmentation provides market insights

### Update Frequency
- **Automated**: Daily at 2:00 AM
- **Manual**: On-demand via API
- **Data Age**: <24 hours

---

## 🎓 Learning Outcomes

This project demonstrates:

1. **API Integration**: Multiple REST APIs, authentication, rate limiting
2. **Async Programming**: httpx, FastAPI async endpoints
3. **Data Processing**: Aggregation, normalization, scoring
4. **Task Scheduling**: Cron jobs, background tasks
5. **Web Development**: Full-stack application (FastAPI + React)
6. **Deployment**: Cloud hosting, environment configuration
7. **Documentation**: Technical writing, API documentation

---

## 📚 References & Resources

### APIs Used
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Discourse API Documentation](https://docs.discourse.org/)
- [Google Trends API (pytrends)](https://pypi.org/project/pytrends/)

### Technologies
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [APScheduler](https://apscheduler.readthedocs.io/)

### n8n Resources
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Documentation](https://docs.n8n.io/)
- [n8n YouTube Channel](https://www.youtube.com/c/n8n-io)

---

## 💡 Future Enhancements

1. **Additional Data Sources**
   - GitHub (workflow templates, stars, forks)
   - Reddit (r/n8n discussions)
   - Twitter/X (hashtag analysis)
   - Stack Overflow (n8n questions)

2. **Advanced Analytics**
   - Sentiment analysis on comments
   - Topic clustering (ML-based)
   - Predictive trending (time series)
   - Workflow category classification

3. **User Features**
   - Saved workflows
   - Email alerts for trending workflows
   - Workflow comparison tool
   - Export to CSV/PDF

4. **Integration**
   - n8n workflow templates marketplace
   - Direct workflow import to n8n
   - Workflow execution statistics

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Technical Assignment for Speak Genie