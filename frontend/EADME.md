# n8n Workflow Popularity Dashboard - Frontend

## 🚀 Quick Start

### 1. Setup

The frontend is a **single HTML file** with no build process required!

### 2. Configuration

Edit `index.html` and update the API URL:

```javascript
// Line ~140 in index.html
const API_BASE_URL = 'http://localhost:8000'; // Change to your backend URL
```

**For production (after deploying backend to Render):**
```javascript
const API_BASE_URL = 'https://your-backend-name.onrender.com';
```

### 3. Run Locally

Option 1 - Python Simple Server:
```bash
cd frontend
python -m http.server 3000
```

Option 2 - Node.js Simple Server:
```bash
npm install -g http-server
http-server -p 3000
```

Option 3 - VS Code Live Server:
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

Access at: `http://localhost:3000`

## 🎨 Features

### Dashboard Overview
- **Real-time Statistics**: Total workflows, platform breakdown, country distribution
- **Multiple Data Sources**: YouTube videos, n8n Forum discussions, Google Search trends
- **Engagement Metrics**: Views, likes, comments, engagement scores

### Filtering & Search
- **Platform Filter**: Filter by YouTube, n8n Forum, or Google Search
- **Country Filter**: Filter by US or India
- **Search**: Search workflows by name/keyword
- **Sort Options**: Sort by engagement score, views, or likes

### Visual Design
- **Dark Theme**: Modern dark UI with glassmorphism effects
- **Gradient Accents**: Purple/indigo gradient highlights
- **Responsive**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Real-time Updates**: Auto-refresh with manual sync button

## 🚀 Deployment to Render (Static Site)

### Method 1: Direct HTML Upload

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Choose "Deploy an existing static site"
4. Upload `index.html`
5. Update `API_BASE_URL` in settings before deploying

### Method 2: GitHub Deploy

1. Create a new GitHub repository
2. Push `index.html` to the repository
3. Go to Render Dashboard → "New" → "Static Site"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: (leave empty)
   - **Publish Directory**: `.` (root)
6. Add environment variable or edit `index.html` before deploy:
   ```javascript
   const API_BASE_URL = 'https://your-backend.onrender.com';
   ```

### Method 3: Using index.html with CDN

Since this is a single HTML file, you can also:
- Deploy to GitHub Pages
- Deploy to Netlify
- Deploy to Vercel
- Host on any static file hosting

## 🔧 Customization

### Change Colors

Edit the CSS in `<style>` section:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your colors */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Change API Refresh Interval

Currently, data is fetched on page load. To add auto-refresh:

```javascript
// Add inside App component
useEffect(() => {
    const interval = setInterval(() => {
        fetchWorkflows();
        fetchStats();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
}, []);
```

### Add More Metrics

To display additional metrics, edit the workflow card section:

```javascript
// Add new metric box
<div className="bg-slate-700 bg-opacity-50 rounded-lg p-3">
    <div className="flex items-center justify-between mb-1">
        <i className="fas fa-your-icon text-color-400"></i>
        <span className="text-white font-semibold">
            {formatNumber(workflow.popularity_metrics.your_metric)}
        </span>
    </div>
    <div className="text-gray-400 text-xs">Your Metric</div>
</div>
```

## 🎯 Testing

### Test with Backend Running

1. Start backend: `python app.py` (port 8000)
2. Start frontend: `python -m http.server 3000`
3. Open: `http://localhost:3000`

### Test Filters

1. Click "All Platforms" → Select "YouTube"
2. Click "All Countries" → Select "US"
3. Type in search box → See filtered results
4. Click sort buttons → See reordered results

### Test Sync

1. Click "Sync Now" button
2. Wait 5-10 seconds
3. Data should refresh with latest information

## 🐛 Troubleshooting

### CORS Errors

If you see CORS errors in browser console:

**Problem**: Backend and frontend on different domains
**Solution**: Ensure backend CORS settings allow your frontend URL

In `backend/app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### No Data Displayed

1. Check backend is running: `curl http://localhost:8000/api/workflows`
2. Check API_BASE_URL is correct in index.html
3. Open browser console (F12) to see errors
4. Try clicking "Sync Now" button

### Styles Not Loading

1. Check internet connection (CDN resources)
2. Clear browser cache
3. Try different browser

## 📱 Mobile Responsiveness

The dashboard is fully responsive:
- **Desktop**: Full layout with all features
- **Tablet**: 2-column grid for cards
- **Mobile**: Single column, stacked layout

Test on different screen sizes using browser DevTools (F12 → Toggle Device Toolbar)

## 🎨 Icons Used

FontAwesome 6.4.0 icons:
- `fa-chart-line`: Dashboard icon
- `fa-database`: Total workflows
- `fa-youtube`: YouTube platform
- `fa-comments`: Forum platform
- `fa-search`: Search platform
- `fa-eye`: Views
- `fa-heart`: Likes
- `fa-comment`: Comments
- `fa-fire`: Engagement
- And many more!

## 📝 Notes

- Single HTML file = Easy deployment
- No build process = Fast setup
- CDN libraries = No npm/node required
- Tailwind CSS = Utility-first styling
- React 18 = Modern UI framework
- All dependencies loaded from CDN

## 🔗 Useful Links

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev/)
- [FontAwesome Icons](https://fontawesome.com/icons)
- [Render Deployment Docs](https://render.com/docs/static-sites)