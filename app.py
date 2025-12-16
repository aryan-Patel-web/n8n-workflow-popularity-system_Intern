"""
n8n Workflow Popularity System - FastAPI Backend
Production-ready API with cron job support
Author: For Speak Genie Internship Assignment
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import httpx
import json
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="n8n Workflow Popularity API",
    description="Identifies the most popular n8n workflows across YouTube, Forums & Search Trends",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Update with your frontend URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to ["https://your-frontend.onrender.com"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
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

class WorkflowData(BaseModel):
    workflow: str
    platform: str
    popularity_metrics: PopularityMetrics
    country: str
    url: Optional[str] = None
    last_updated: str

class WorkflowResponse(BaseModel):
    total_workflows: int
    data: List[WorkflowData]
    last_sync: str
    platforms: Dict[str, int]
    countries: Dict[str, int]

# In-memory storage (replace with database in production)
workflow_cache = {
    "data": [],
    "last_updated": None
}

# API Configuration
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
N8N_FORUM_URL = "https://community.n8n.io"

# Validate API Key on startup
if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
    logger.warning("⚠️  YouTube API Key not set! Set YOUTUBE_API_KEY environment variable.")
    logger.warning("⚠️  YouTube data collection will be skipped.")

# Common n8n workflow keywords
N8N_WORKFLOW_KEYWORDS = [
    "n8n automation", "n8n workflow", "n8n tutorial", "n8n integration",
    "n8n slack", "n8n gmail", "n8n google sheets", "n8n webhook",
    "n8n discord", "n8n twitter", "n8n instagram", "n8n whatsapp",
    "n8n airtable", "n8n notion", "n8n postgres", "n8n mongodb",
    "n8n stripe", "n8n shopify", "n8n wordpress", "n8n zapier alternative",
    "n8n api integration", "n8n database", "n8n email automation",
    "n8n social media", "n8n crm", "n8n scheduling", "n8n data sync",
    "n8n openai", "n8n chatgpt", "n8n ai automation", "n8n machine learning"
]

# Helper Functions
def calculate_engagement_score(metrics: Dict) -> float:
    """Calculate overall engagement score using weighted algorithm"""
    views = metrics.get('views', 0) or 1
    likes = metrics.get('likes', 0)
    comments = metrics.get('comments', 0)
    replies = metrics.get('replies', 0)
    
    # Weighted scoring: likes=2x, comments=3x, replies=3x
    engagement = ((likes * 2) + (comments * 3) + (replies * 3)) / views
    return round(engagement * 1000, 2)

async def fetch_youtube_workflows(country: str = "US") -> List[WorkflowData]:
    """
    Fetch popular n8n workflow videos from YouTube Data API v3
    
    DATA SOURCE 1: YouTube
    - Videos with statistics (views, likes, comments)
    - Filtered by country (US/IN)
    - Sorted by relevance
    """
    workflows = []
    
    # Skip if API key not configured
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        logger.warning(f"Skipping YouTube data collection for {country} - API key not set")
        return workflows
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for keyword in N8N_WORKFLOW_KEYWORDS[:15]:  # Limit to avoid quota
                try:
                    # Search for videos
                    search_url = "https://www.googleapis.com/youtube/v3/search"
                    search_params = {
                        "part": "snippet",
                        "q": keyword,
                        "type": "video",
                        "maxResults": 5,
                        "regionCode": country,
                        "key": YOUTUBE_API_KEY,
                        "order": "relevance"
                    }
                    
                    search_response = await client.get(search_url, params=search_params)
                    
                    if search_response.status_code == 403:
                        logger.error("❌ YouTube API quota exceeded or invalid API key!")
                        break
                    
                    if search_response.status_code != 200:
                        logger.warning(f"YouTube API error for {keyword}: {search_response.status_code}")
                        continue
                    
                    search_data = search_response.json()
                    
                    if "error" in search_data:
                        logger.error(f"YouTube API error: {search_data['error'].get('message', 'Unknown error')}")
                        break
                    
                    if "items" not in search_data:
                        continue
                    
                    video_ids = [item["id"]["videoId"] for item in search_data["items"] if "videoId" in item["id"]]
                    
                    if not video_ids:
                        continue
                    
                    # Get video statistics
                    stats_url = "https://www.googleapis.com/youtube/v3/videos"
                    stats_params = {
                        "part": "statistics,snippet",
                        "id": ",".join(video_ids),
                        "key": YOUTUBE_API_KEY
                    }
                    
                    stats_response = await client.get(stats_url, params=stats_params)
                    
                    if stats_response.status_code != 200:
                        continue
                    
                    stats_data = stats_response.json()
                    
                    for video in stats_data.get("items", []):
                        stats = video["statistics"]
                        snippet = video["snippet"]
                        
                        views = int(stats.get("viewCount", 0))
                        likes = int(stats.get("likeCount", 0))
                        comments = int(stats.get("commentCount", 0))
                        
                        if views < 100:  # Filter low-quality results
                            continue
                        
                        like_ratio = likes / views if views > 0 else 0
                        comment_ratio = comments / views if views > 0 else 0
                        
                        metrics = PopularityMetrics(
                            views=views,
                            likes=likes,
                            comments=comments,
                            like_to_view_ratio=round(like_ratio, 4),
                            comment_to_view_ratio=round(comment_ratio, 4),
                            engagement_score=calculate_engagement_score({
                                "views": views,
                                "likes": likes,
                                "comments": comments
                            })
                        )
                        
                        workflow = WorkflowData(
                            workflow=snippet["title"][:100],
                            platform="YouTube",
                            popularity_metrics=metrics,
                            country=country,
                            url=f"https://youtube.com/watch?v={video['id']}",
                            last_updated=datetime.now().isoformat()
                        )
                        
                        workflows.append(workflow)
                        
                    await asyncio.sleep(0.5)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error fetching YouTube data for {keyword}: {str(e)}")
                    continue
    
    except Exception as e:
        logger.error(f"YouTube API error: {str(e)}")
    
    return workflows

async def fetch_forum_workflows(country: str = "US") -> List[WorkflowData]:
    """
    Fetch popular workflows from n8n community forum (Discourse API)
    
    DATA SOURCE 2: n8n Forum
    - Public API, no authentication needed
    - Discussion threads with replies and likes
    - Community engagement metrics
    """
    workflows = []
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch top topics from n8n forum
            topics_url = f"{N8N_FORUM_URL}/top.json"
            params = {"period": "all"}
            
            response = await client.get(topics_url, params=params)
            
            if response.status_code != 200:
                logger.warning(f"Forum API error: {response.status_code}")
                return workflows
            
            data = response.json()
            
            for topic_data in data.get("topic_list", {}).get("topics", [])[:30]:
                try:
                    topic_id = topic_data["id"]
                    
                    # Get detailed topic information
                    topic_url = f"{N8N_FORUM_URL}/t/{topic_id}.json"
                    topic_response = await client.get(topic_url)
                    
                    if topic_response.status_code != 200:
                        continue
                    
                    topic_detail = topic_response.json()
                    
                    views = topic_data.get("views", 0)
                    likes = topic_data.get("like_count", 0)
                    replies = topic_data.get("posts_count", 1) - 1
                    
                    # Count unique contributors
                    posters = topic_data.get("posters", [])
                    contributors = len(posters)
                    
                    if views < 50:  # Filter low-engagement topics
                        continue
                    
                    metrics = PopularityMetrics(
                        views=views,
                        likes=likes,
                        replies=replies,
                        contributors=contributors,
                        engagement_score=calculate_engagement_score({
                            "views": views,
                            "likes": likes,
                            "replies": replies
                        })
                    )
                    
                    workflow = WorkflowData(
                        workflow=topic_data["title"][:100],
                        platform="n8n Forum",
                        popularity_metrics=metrics,
                        country=country,
                        url=f"{N8N_FORUM_URL}/t/{topic_data['slug']}/{topic_id}",
                        last_updated=datetime.now().isoformat()
                    )
                    
                    workflows.append(workflow)
                    
                    await asyncio.sleep(0.3)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error processing forum topic: {str(e)}")
                    continue
    
    except Exception as e:
        logger.error(f"Forum API error: {str(e)}")
    
    return workflows

async def fetch_search_trends(country: str = "US") -> List[WorkflowData]:
    """
    Generate workflow data based on search trends
    
    DATA SOURCE 3: Google Search Trends
    - Simulated data (replace with Google Trends API in production)
    - Search volume and trend percentage
    - Country-specific data
    
    NOTE: For production, integrate real Google Trends API (pytrends)
    """
    workflows = []
    
    # Simulated search trend data
    # In production, replace with: from pytrends.request import TrendReq
    search_trends = [
        {"keyword": "n8n Slack integration", "volume": 3600, "trend": 42.5},
        {"keyword": "n8n Gmail automation", "volume": 2800, "trend": 35.2},
        {"keyword": "n8n Google Sheets sync", "volume": 2400, "trend": 28.7},
        {"keyword": "n8n Webhook automation", "volume": 2100, "trend": 15.3},
        {"keyword": "n8n Discord bot", "volume": 1900, "trend": 51.2},
        {"keyword": "n8n Notion integration", "volume": 1750, "trend": 44.8},
        {"keyword": "n8n Airtable workflow", "volume": 1600, "trend": 22.1},
        {"keyword": "n8n API automation", "volume": 1500, "trend": 18.9},
        {"keyword": "n8n ChatGPT integration", "volume": 4200, "trend": 89.5},
        {"keyword": "n8n OpenAI workflow", "volume": 3100, "trend": 76.3},
        {"keyword": "n8n WhatsApp automation", "volume": 1400, "trend": 31.4},
        {"keyword": "n8n Twitter bot", "volume": 1200, "trend": 12.8},
        {"keyword": "n8n Instagram automation", "volume": 1350, "trend": 25.6},
        {"keyword": "n8n MongoDB integration", "volume": 980, "trend": 19.7},
        {"keyword": "n8n PostgreSQL workflow", "volume": 890, "trend": 14.2},
    ]
    
    # Adjust volume for India market (typically lower)
    volume_multiplier = 0.6 if country == "IN" else 1.0
    
    for trend in search_trends:
        adjusted_volume = int(trend["volume"] * volume_multiplier)
        
        metrics = PopularityMetrics(
            search_volume=adjusted_volume,
            trend_change=trend["trend"],
            engagement_score=adjusted_volume * (1 + trend["trend"]/100)
        )
        
        workflow = WorkflowData(
            workflow=trend["keyword"],
            platform="Google Search",
            popularity_metrics=metrics,
            country=country,
            last_updated=datetime.now().isoformat()
        )
        
        workflows.append(workflow)
    
    return workflows

async def collect_all_workflows():
    """
    Collect workflows from all 3 data sources for both countries
    
    Assignment Requirements:
    - Minimum 50 workflows
    - 3 data sources: YouTube, Forum, Search
    - 2 countries: US, IN
    - Evidence-based popularity metrics
    """
    logger.info("=" * 60)
    logger.info("🚀 Starting workflow collection...")
    logger.info("=" * 60)
    
    all_workflows = []
    
    # Collect from all sources for both countries
    countries = ["US", "IN"]
    
    for country in countries:
        logger.info(f"\n📍 Collecting workflows for {country}...")
        
        # DATA SOURCE 1: YouTube
        logger.info(f"   🔴 Fetching from YouTube...")
        youtube_workflows = await fetch_youtube_workflows(country)
        all_workflows.extend(youtube_workflows)
        logger.info(f"   ✅ Collected {len(youtube_workflows)} YouTube workflows")
        
        # DATA SOURCE 2: n8n Forum (fetch once for US, reuse for IN)
        if country == "US":
            logger.info(f"   🟢 Fetching from n8n Forum...")
            forum_workflows = await fetch_forum_workflows(country)
            all_workflows.extend(forum_workflows)
            logger.info(f"   ✅ Collected {len(forum_workflows)} forum workflows")
        
        # DATA SOURCE 3: Google Search Trends
        logger.info(f"   🔵 Fetching search trends...")
        search_workflows = await fetch_search_trends(country)
        all_workflows.extend(search_workflows)
        logger.info(f"   ✅ Collected {len(search_workflows)} search trend workflows")
    
    # Sort by engagement score (highest first)
    all_workflows.sort(key=lambda x: x.popularity_metrics.engagement_score, reverse=True)
    
    # Update cache
    workflow_cache["data"] = all_workflows
    workflow_cache["last_updated"] = datetime.now().isoformat()
    
    logger.info("\n" + "=" * 60)
    logger.info(f"🎉 TOTAL WORKFLOWS COLLECTED: {len(all_workflows)}")
    logger.info(f"📊 Target: 50+ | Actual: {len(all_workflows)} | Status: {'✅ PASS' if len(all_workflows) >= 50 else '❌ FAIL'}")
    logger.info("=" * 60)
    
    return all_workflows

# API Endpoints
@app.get("/")
async def root():
    """API root endpoint with documentation"""
    return {
        "message": "🚀 n8n Workflow Popularity API",
        "version": "1.0.0",
        "status": "running",
        "author": "Speak Genie Internship Assignment",
        "endpoints": {
            "/": "This page",
            "/api/workflows": "Get all workflows (with filters)",
            "/api/workflows/platform/{platform}": "Filter by platform",
            "/api/workflows/country/{country}": "Filter by country",
            "/api/sync": "Manually trigger data sync",
            "/api/stats": "Get statistics",
            "/api/health": "Health check",
            "/docs": "Interactive API documentation (Swagger)",
            "/redoc": "Alternative API documentation (ReDoc)"
        },
        "data_sources": [
            "YouTube Data API v3",
            "n8n Community Forum (Discourse)",
            "Google Search Trends (Simulated)"
        ]
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "youtube_api_configured": bool(YOUTUBE_API_KEY and YOUTUBE_API_KEY != "YOUR_YOUTUBE_API_KEY_HERE"),
        "workflows_cached": len(workflow_cache["data"]),
        "last_sync": workflow_cache["last_updated"] or "Never",
        "uptime": "keeping alive"
    }

@app.get("/keep-alive")
async def keep_alive():
    """Endpoint specifically for keep-alive pings"""
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat(),
        "message": "Server is awake and running"
    }

@app.get("/api/workflows", response_model=WorkflowResponse)
async def get_workflows(
    platform: Optional[str] = None,
    country: Optional[str] = None,
    limit: Optional[int] = None
):
    """
    Get all workflows with optional filters
    
    Query Parameters:
    - platform: Filter by platform (YouTube, n8n Forum, Google Search)
    - country: Filter by country (US, IN)
    - limit: Limit number of results
    
    Example: /api/workflows?platform=YouTube&country=US&limit=10
    """
    
    # Collect data if not available
    if not workflow_cache["data"]:
        logger.info("No cached data, collecting workflows...")
        await collect_all_workflows()
    
    workflows = workflow_cache["data"]
    
    # Apply filters
    if platform:
        workflows = [w for w in workflows if w.platform.lower() == platform.lower()]
    
    if country:
        workflows = [w for w in workflows if w.country.upper() == country.upper()]
    
    if limit:
        workflows = workflows[:limit]
    
    # Calculate statistics
    platform_counts = defaultdict(int)
    country_counts = defaultdict(int)
    
    for w in workflow_cache["data"]:
        platform_counts[w.platform] += 1
        country_counts[w.country] += 1
    
    return WorkflowResponse(
        total_workflows=len(workflows),
        data=workflows,
        last_sync=workflow_cache["last_updated"] or "Never",
        platforms=dict(platform_counts),
        countries=dict(country_counts)
    )

@app.get("/api/workflows/platform/{platform}")
async def get_workflows_by_platform(platform: str):
    """Get workflows filtered by platform"""
    return await get_workflows(platform=platform)

@app.get("/api/workflows/country/{country}")
async def get_workflows_by_country(country: str):
    """Get workflows filtered by country"""
    return await get_workflows(country=country)

@app.post("/api/sync")
async def trigger_sync(background_tasks: BackgroundTasks):
    """
    Manually trigger data synchronization
    
    This will fetch fresh data from all 3 sources:
    - YouTube Data API v3
    - n8n Community Forum
    - Google Search Trends
    """
    background_tasks.add_task(collect_all_workflows)
    return {
        "message": "Data synchronization started",
        "status": "processing",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/stats")
async def get_statistics():
    """
    Get comprehensive system statistics
    
    Returns:
    - Total workflows
    - Platform breakdown
    - Country breakdown
    - Top workflow
    - Engagement metrics
    """
    if not workflow_cache["data"]:
        return {
            "message": "No data available. Trigger /api/sync first.",
            "total_workflows": 0,
            "status": "no_data"
        }
    
    workflows = workflow_cache["data"]
    
    platform_stats = defaultdict(lambda: {"count": 0, "total_views": 0, "avg_engagement": 0})
    country_stats = defaultdict(int)
    
    for w in workflows:
        platform_stats[w.platform]["count"] += 1
        platform_stats[w.platform]["total_views"] += w.popularity_metrics.views or 0
        platform_stats[w.platform]["avg_engagement"] += w.popularity_metrics.engagement_score
        country_stats[w.country] += 1
    
    # Calculate averages
    for platform in platform_stats:
        count = platform_stats[platform]["count"]
        platform_stats[platform]["avg_engagement"] = round(
            platform_stats[platform]["avg_engagement"] / count, 2
        )
    
    return {
        "total_workflows": len(workflows),
        "last_updated": workflow_cache["last_updated"],
        "platforms": dict(platform_stats),
        "countries": dict(country_stats),
        "top_workflow": workflows[0].workflow if workflows else None,
        "assignment_status": {
            "target": 50,
            "actual": len(workflows),
            "met": len(workflows) >= 50
        }
    }

# Scheduler for automatic updates
scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("=" * 60)
    logger.info("🚀 Starting n8n Workflow Popularity API...")
    logger.info("=" * 60)
    logger.info(f"📅 Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"🔑 YouTube API Key configured: {bool(YOUTUBE_API_KEY and YOUTUBE_API_KEY != 'YOUR_YOUTUBE_API_KEY_HERE')}")
    logger.info(f"🌐 n8n Forum URL: {N8N_FORUM_URL}")
    
    # Initial data collection
    await collect_all_workflows()
    
    # Schedule daily updates (runs at 2 AM every day)
    scheduler.add_job(
        collect_all_workflows,
        'cron',
        hour=2,
        minute=0,
        id='daily_workflow_sync'
    )
    
    scheduler.start()
    logger.info("\n⏰ Scheduler started - Daily sync at 2:00 AM")
    logger.info("=" * 60)
    logger.info("✅ API is ready! Visit /docs for interactive documentation")
    logger.info("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    scheduler.shutdown()
    logger.info("🛑 Scheduler stopped")
    logger.info("👋 API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)