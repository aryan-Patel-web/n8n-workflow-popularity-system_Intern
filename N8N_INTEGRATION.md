# n8n Integration Guide - Workflow Automation

This guide shows you how to use **n8n** to automate tasks with your Workflow Popularity System.

---

## 📋 What is n8n?

**n8n** (nodemation) is a fair-code licensed workflow automation tool. It allows you to connect different services and automate tasks without writing code.

**Use Cases**:
- Trigger notifications when new popular workflows are found
- Send daily reports via Slack/Email
- Export data to Google Sheets
- Create alerts for trending workflows

---

## 🚀 Getting Started with n8n

### Option 1: Cloud (Easiest)

1. Go to [n8n.cloud](https://n8n.cloud/)
2. Sign up for free account
3. Create new workflow
4. Start building!

### Option 2: Self-Hosted (Docker)

```bash
# Install n8n via Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

### Option 3: npm Install

```bash
# Install n8n globally
npm install n8n -g

# Start n8n
n8n start

# Access at http://localhost:5678
```

---

## 🔗 Connecting to Your API

### Basic Setup

1. **Open n8n** (http://localhost:5678 or n8n.cloud)
2. **Create New Workflow**
3. **Add HTTP Request Node**

### Configure HTTP Request Node

**Settings**:
```
Method: GET
URL: https://your-backend.onrender.com/api/workflows
Authentication: None (or add if you implement auth)
```

**Headers** (optional):
```json
{
  "Content-Type": "application/json"
}
```

---

## 🎯 Use Case 1: Daily Workflow Report to Slack

This workflow fetches popular workflows daily and sends a summary to Slack.

### Workflow Steps

```
1. Schedule Trigger (Daily 9 AM)
   ↓
2. HTTP Request (Get workflows)
   ↓
3. Function (Process data)
   ↓
4. Slack (Send message)
```

### Step-by-Step Setup

**Step 1: Schedule Trigger**
- Add **Schedule Trigger** node
- Set to run daily at 9:00 AM
- Rule: `0 9 * * *` (cron format)

**Step 2: HTTP Request**
- Add **HTTP Request** node
- Method: `GET`
- URL: `https://your-backend.onrender.com/api/workflows?limit=10`

**Step 3: Function Node** (Process Data)
```javascript
// Get top 5 workflows
const workflows = items[0].json.data.slice(0, 5);

// Format message
let message = "🔥 Top 5 n8n Workflows Today:\n\n";

workflows.forEach((w, index) => {
  message += `${index + 1}. *${w.workflow}*\n`;
  message += `   Platform: ${w.platform}\n`;
  message += `   Engagement: ${w.popularity_metrics.engagement_score}\n`;
  message += `   Views: ${w.popularity_metrics.views || 'N/A'}\n\n`;
});

return [{
  json: {
    message: message
  }
}];
```

**Step 4: Slack Node**
- Add **Slack** node
- Connect to your Slack workspace
- Select channel: `#general` (or your channel)
- Message: `={{ $json.message }}`

**Save and Activate!**

---

## 🎯 Use Case 2: Export to Google Sheets

Track workflow popularity over time in Google Sheets.

### Workflow Steps

```
1. Schedule Trigger (Weekly)
   ↓
2. HTTP Request (Get workflows)
   ↓
3. Google Sheets (Append data)
```

### Step-by-Step Setup

**Step 1: Schedule Trigger**
- Frequency: Every Monday at 10 AM
- Cron: `0 10 * * 1`

**Step 2: HTTP Request**
- URL: `https://your-backend.onrender.com/api/workflows`

**Step 3: Google Sheets**
- Add **Google Sheets** node
- Operation: **Append**
- Connect to Google account
- Select/create spreadsheet: "n8n Workflow Tracker"
- Sheet: "Weekly Data"

**Map Fields**:
```
Workflow Name: {{ $json.workflow }}
Platform: {{ $json.platform }}
Views: {{ $json.popularity_metrics.views }}
Likes: {{ $json.popularity_metrics.likes }}
Engagement: {{ $json.popularity_metrics.engagement_score }}
Date: {{ $now.format('YYYY-MM-DD') }}
```

---

## 🎯 Use Case 3: Alert for Viral Workflows

Get notified when a workflow goes viral (engagement > 200).

### Workflow Steps

```
1. Webhook Trigger
   ↓
2. HTTP Request (Get workflows)
   ↓
3. Filter (engagement > 200)
   ↓
4. Email/Discord/Telegram (Send alert)
```

### Step-by-Step Setup

**Step 1: Webhook Trigger**
- Add **Webhook** node
- Method: GET
- Path: `/check-viral`
- Copy webhook URL

**Step 2: HTTP Request**
- URL: `https://your-backend.onrender.com/api/workflows?limit=50`

**Step 3: Filter Node**
- Add **Filter** node
- Condition: `{{ $json.popularity_metrics.engagement_score }} > 200`

**Step 4: Email Node**
- Add **Email** (Gmail/Outlook/SMTP)
- To: your-email@example.com
- Subject: `🚨 Viral n8n Workflow Detected!`
- Body:
```
Workflow: {{ $json.workflow }}
Platform: {{ $json.platform }}
Engagement Score: {{ $json.popularity_metrics.engagement_score }}
Views: {{ $json.popularity_metrics.views }}
Link: {{ $json.url }}
```

**Trigger webhook** (manually or via external cron):
```bash
curl https://your-n8n-url/webhook/check-viral
```

---

## 🎯 Use Case 4: Auto-Sync Trigger

Automatically trigger your API's sync endpoint daily.

### Simple Workflow

```
1. Schedule Trigger (Daily 2 AM)
   ↓
2. HTTP Request (POST /api/sync)
   ↓
3. Slack (Notify completion)
```

### Setup

**Step 1: Schedule**
- Daily at 2:00 AM
- Cron: `0 2 * * *`

**Step 2: HTTP Request**
- Method: `POST`
- URL: `https://your-backend.onrender.com/api/sync`

**Step 3: Slack Notification**
- Message: `✅ Workflow sync completed at {{ $now.format('h:mm A') }}`

---

## 🎯 Use Case 5: Multi-Platform Report

Compare workflows across platforms and send detailed report.

### Workflow

```
1. Schedule Trigger
   ↓
2. HTTP Request (Get YouTube workflows)
   ↓
3. HTTP Request (Get Forum workflows)
   ↓
4. HTTP Request (Get Search workflows)
   ↓
5. Merge Data
   ↓
6. Function (Create comparison)
   ↓
7. Email (Send report)
```

### Function Node (Create Comparison)

```javascript
// Aggregate data by platform
const youtube = items.filter(i => i.json.platform === 'YouTube');
const forum = items.filter(i => i.json.platform === 'n8n Forum');
const search = items.filter(i => i.json.platform === 'Google Search');

// Calculate averages
const avgEngagement = (arr) => {
  const sum = arr.reduce((acc, item) => 
    acc + item.json.popularity_metrics.engagement_score, 0);
  return (sum / arr.length).toFixed(2);
};

const report = `
📊 n8n Workflow Platform Comparison
Date: ${new Date().toLocaleDateString()}

YouTube:
- Workflows: ${youtube.length}
- Avg Engagement: ${avgEngagement(youtube)}
- Top: ${youtube[0]?.json.workflow || 'N/A'}

Forum:
- Workflows: ${forum.length}
- Avg Engagement: ${avgEngagement(forum)}
- Top: ${forum[0]?.json.workflow || 'N/A'}

Search:
- Workflows: ${search.length}
- Avg Engagement: ${avgEngagement(search)}
- Top: ${search[0]?.json.workflow || 'N/A'}
`;

return [{ json: { report } }];
```

---

## 🔐 Authentication (Optional)

If you add authentication to your API, configure n8n:

### API Key Authentication

**In n8n HTTP Request Node**:
- Header Authentication
- Header Name: `X-API-Key`
- Header Value: `your_api_key`

### OAuth2

- Use n8n's OAuth2 credential type
- Configure client ID, secret, and endpoints

---

## 🎨 Advanced Workflows

### Workflow 1: Trending Alert System

```
1. Schedule (Every 4 hours)
   ↓
2. Get workflows
   ↓
3. Store in database (n8n's PostgreSQL node)
   ↓
4. Compare with previous data
   ↓
5. Detect trending (30%+ growth)
   ↓
6. Send push notification
```

### Workflow 2: AI-Powered Summary

```
1. Get workflows
   ↓
2. OpenAI (Summarize top workflows)
   ↓
3. Format as newsletter
   ↓
4. Send via email
```

### Workflow 3: Auto-Documentation

```
1. Get new popular workflows
   ↓
2. Generate documentation
   ↓
3. Create GitHub issue/PR
   ↓
4. Notify team
```

---

## 📊 n8n Nodes You'll Use

### Core Nodes

1. **HTTP Request**: Call your API
2. **Schedule Trigger**: Run workflows on schedule
3. **Webhook**: Receive HTTP requests
4. **Function**: Process data with JavaScript
5. **IF/Switch**: Conditional logic
6. **Filter**: Filter items by condition

### Integration Nodes

1. **Slack**: Send messages
2. **Discord**: Send messages
3. **Telegram**: Send messages
4. **Email** (Gmail, Outlook): Send emails
5. **Google Sheets**: Read/write spreadsheets
6. **Airtable**: Database operations
7. **Notion**: Update pages
8. **Twitter**: Post tweets
9. **GitHub**: Create issues
10. **OpenAI**: AI processing

---

## 🐛 Troubleshooting n8n

### Common Issues

**Issue**: CORS error when calling API
```
Solution: Ensure CORS is enabled on your backend
Check allow_origins includes n8n domain
```

**Issue**: Workflow not triggering
```
Solution:
1. Check workflow is "Active"
2. Verify trigger configuration
3. Check n8n logs
4. Test manually first
```

**Issue**: HTTP Request fails
```
Solution:
1. Verify URL is correct
2. Check API is running
3. Test with curl/Postman first
4. Check authentication
```

**Issue**: Data not mapping correctly
```
Solution:
1. Use "Execute Node" to test
2. Check JSON structure
3. Use {{ $json.field }} syntax
4. Add Set node to restructure data
```

---

## 📚 Learning Resources

### Official Resources
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n YouTube Channel](https://www.youtube.com/c/n8n-io)
- [n8n Templates](https://n8n.io/workflows/)

### Tutorials
- [n8n Quickstart Guide](https://docs.n8n.io/getting-started/quickstart/)
- [HTTP Request Node Guide](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Function Node Examples](https://docs.n8n.io/code-examples/javascript-code-snippets/)

---

## 💡 Best Practices

### 1. Error Handling
Always add error workflows:
- Catch errors with Error Trigger
- Log to monitoring service
- Send alerts on failures

### 2. Rate Limiting
Be mindful of API quotas:
- Don't run too frequently
- Cache data when possible
- Use reasonable limits

### 3. Testing
Test workflows before activating:
- Use "Execute Workflow" button
- Check with sample data
- Monitor first few runs

### 4. Documentation
Document your workflows:
- Add notes to complex nodes
- Use descriptive workflow names
- Keep workflows simple

### 5. Monitoring
Monitor workflow execution:
- Check execution history
- Set up error notifications
- Review performance metrics

---

## 🎓 Sample Workflow Templates

I've created sample workflow JSON files you can import:

### Template 1: Daily Report
```json
{
  "name": "Daily Workflow Report",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 24}]
        }
      }
    }
    // ... more nodes
  ]
}
```

To import:
1. Go to n8n
2. Click "Import from URL" or "Import from File"
3. Paste workflow JSON
4. Configure credentials

---

## ✅ Quick Start Checklist

- [ ] n8n installed/accessed
- [ ] New workflow created
- [ ] HTTP Request node added
- [ ] API URL configured
- [ ] Test execution successful
- [ ] Integration node added (Slack/Email)
- [ ] Credentials configured
- [ ] Workflow tested end-to-end
- [ ] Workflow activated
- [ ] Monitoring set up

---

## 🎉 You're Ready!

You now know how to:
- ✅ Set up n8n
- ✅ Connect to your API
- ✅ Create automated workflows
- ✅ Send notifications
- ✅ Export data
- ✅ Build advanced automations

**Start with a simple workflow and build from there!**

---

**Need Help?**
- Join [n8n Community Forum](https://community.n8n.io/)
- Check [n8n Discord](https://discord.gg/n8n)
- Read [n8n Documentation](https://docs.n8n.io/)