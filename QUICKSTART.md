# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd /c/Users/OCPCz/Desktop/ai-training-data-collector
npm install
```

### Step 2: Configure Input

Edit `input.json` to set your crawl parameters:

```json
{
  "startUrls": [{"url": "https://your-target-site.com"}],
  "maxPagesPerDomain": 50,
  "topicKeywords": ["your", "topic", "keywords"],
  "outputFormat": "markdown"
}
```

### Step 3: Run Locally

```bash
npm start
```

### Step 4: Check Results

Results are saved in:
```
./apify_storage/datasets/default/
```

Each run creates JSON files with extracted content.

## 📊 View Cost Summary

Check the summary:
```
./apify_storage/key_value_stores/default/SUMMARY.json
```

Shows:
- Pages collected
- Total tokens
- Estimated cost

## 🎯 Example Use Cases

### 1. Collect Blog Content
```json
{
  "startUrls": [{"url": "https://blog.example.com"}],
  "maxPagesPerDomain": 100,
  "outputFormat": "markdown"
}
```

### 2. Build Knowledge Base (Topic-Specific)
```json
{
  "startUrls": [
    {"url": "https://docs.python.org"},
    {"url": "https://realpython.com"}
  ],
  "topicKeywords": ["python", "tutorial", "programming"],
  "maxPagesPerDomain": 200,
  "autoTagging": true
}
```

### 3. RAG Pipeline Data (Embedding-Ready)
```json
{
  "startUrls": [{"url": "https://support.yourcompany.com"}],
  "embeddings": true,
  "mcpCompatible": true,
  "minContentLength": 300
}
```

### 4. Cost-Controlled Crawl
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "tokenLimit": 100000,
  "maxPagesPerDomain": 50
}
```

## 🔧 Deploy to Apify

### Option 1: Via GitHub

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: AI Training Data Collector"
git remote add origin <your-repo-url>
git push -u origin main
```

2. Go to [Apify Console](https://console.apify.com)
3. Click "Actors" → "Create new"
4. Choose "Import from GitHub"
5. Connect your repository
6. Click "Build"

### Option 2: Via Apify CLI

```bash
# Install Apify CLI
npm install -g apify-cli

# Login
apify login

# Push to Apify
apify push
```

## 💰 Pricing

**$5 per 10,000 tokens**

### Cost Examples:
- 50 pages (500K tokens): **$2.50**
- 200 pages (2M tokens): **$10.00**
- 1000 pages (10M tokens): **$50.00**

### Control Costs:
- Set `tokenLimit` to cap spending
- Use `topicKeywords` to collect only relevant content
- Adjust `minContentLength` to skip thin pages

## 🤖 MCP Integration (Claude/GPT)

### Setup for Claude Desktop

1. Add to Claude config (`~/Library/Application Support/Claude/config.json`):
```json
{
  "mcpServers": {
    "ai-data-collector": {
      "command": "npx",
      "args": ["-y", "@apify/mcp-server-apify", "YOUR_ACTOR_ID"],
      "env": {
        "APIFY_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

2. Restart Claude

3. Use in conversation:
```
"Collect training data about React from reactjs.org"
```

## 📈 Monitor Performance

Watch the console for real-time updates:
- ✅ Pages collected
- ⚠️ Pages skipped
- 🏷️ Auto-tags extracted
- 💰 Token count and cost estimate

## 🐛 Troubleshooting

### "No content found"
- Check `contentSelectors` - may need custom selectors
- Try different URLs
- Check site allows crawling

### "Content too short"
- Lower `minContentLength` (default: 100 words)
- Check `excludeSelectors` aren't removing content

### High costs
- Set `tokenLimit` to cap spending
- Reduce `maxPagesPerDomain`
- Use `topicKeywords` for filtering

## 🎓 Next Steps

1. **Test locally** with small crawls
2. **Deploy to Apify** for production use
3. **Integrate with LangChain/LlamaIndex**
4. **Set up MCP** for AI agent access
5. **Build RAG applications** with collected data

## 📚 Resources

- Full README: `README.md`
- Input schema: `INPUT_SCHEMA.json`
- MCP config: `mcp-config.json`

---

**Happy collecting! 🚀**
