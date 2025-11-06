# AI Training Data Collector (MCP-Compatible)

Extract clean, LLM-ready content from websites for AI training, RAG pipelines, and vector databases. Features auto-categorization, smart content extraction, token counting, and seamless integration with Claude/GPT via Model Context Protocol.

## 🌟 Features

### Intelligent Content Extraction
- **Smart content detection** - Automatically identifies main content, removes navigation/ads
- **Multi-site crawling** - Follow links across domains with configurable depth
- **Topic filtering** - Only collect content matching your keywords
- **Minimum quality thresholds** - Skip thin content automatically

### AI-Ready Output Formats
- **Markdown files** - Individual `.md` files per page + combined training file
- **JSON dataset** - Structured data with metadata and token counts
- **Plain text** - Simple text extraction
- **Download ready** - All files available in Key-Value Store

### Automatic Categorization
- **NLP-powered tagging** - Automatically extract topics and keywords
- **Metadata extraction** - Title, author, publication date, description
- **Token counting** - Precise cost calculation using tiktoken (GPT-4 tokenizer)

### Vector Database Integration
- **Embedding-ready format** - Pre-formatted for ChromaDB, Pinecone, Weaviate
- **Unique IDs** - Auto-generated document identifiers
- **Metadata preservation** - Source URLs, tags, titles

### MCP Compatibility
- **Claude integration** - Use as a tool in Claude Desktop
- **GPT integration** - Compatible with GPT agent frameworks
- **Real-time data access** - AI agents can autonomously collect fresh training data

## 🚀 Use Cases

### 1. RAG Pipeline Data Collection
Build knowledge bases for retrieval-augmented generation:
```
Input: Company documentation sites, technical blogs
Output: Clean markdown chunks with metadata
Use: Feed into LangChain, LlamaIndex, or custom RAG systems
```

### 2. LLM Fine-Tuning Datasets
Collect domain-specific training data:
```
Input: Industry-specific websites, research papers, forums
Output: High-quality text with auto-tagging
Use: Fine-tune GPT, Claude, or open-source models
```

### 3. AI Agent Knowledge Bases
Real-time data for AI agents:
```
Input: News sites, product pages, documentation
Output: MCP-compatible format
Use: Claude/GPT agents access fresh data on demand
```

### 4. Research & Analysis
Automated content aggregation:
```
Input: Multiple sources on a topic
Output: Categorized, tagged content
Use: Market research, competitive intelligence, trend analysis
```

## 📋 Input Configuration

### Required Fields

**Start URLs**
- URLs to begin crawling
- Example: `["https://blog.example.com", "https://docs.example.com"]`

### Optional Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `crawlStrategy` | same-domain | How to follow links (same-domain, same-hostname, all) |
| `maxCrawlDepth` | 3 | Maximum link depth from start URLs |
| `maxPagesPerDomain` | 100 | Page limit per domain (controls cost) |
| `topicKeywords` | [] | Filter by topics (empty = collect all) |
| `contentSelectors` | auto | CSS selectors for main content |
| `excludeSelectors` | nav, footer, etc | Elements to remove |
| `outputFormat` | markdown | Output format (markdown/plain-text/json) |
| `includeMetadata` | true | Include title, author, dates, tags |
| `autoTagging` | true | NLP-powered keyword extraction |
| `minContentLength` | 100 words | Minimum quality threshold |
| `tokenLimit` | unlimited | Stop after N tokens (cost control) |
| `embeddings` | false | Generate embedding-ready format |
| `mcpCompatible` | true | Model Context Protocol format |

## 🎯 Example Inputs

### Basic Documentation Scraping
```json
{
  "startUrls": ["https://docs.python.org/3/"],
  "maxPagesPerDomain": 200,
  "topicKeywords": ["python", "programming", "tutorial"],
  "outputFormat": "markdown"
}
```

### AI Training Data Collection
```json
{
  "startUrls": [
    "https://machinelearningmastery.com",
    "https://towardsdatascience.com"
  ],
  "topicKeywords": ["machine learning", "deep learning", "neural networks"],
  "maxPagesPerDomain": 500,
  "autoTagging": true,
  "embeddings": true,
  "minContentLength": 300
}
```

### RAG Pipeline for Customer Support
```json
{
  "startUrls": ["https://support.yourcompany.com"],
  "crawlStrategy": "same-domain",
  "outputFormat": "markdown",
  "embeddings": true,
  "mcpCompatible": true,
  "contentSelectors": [".article-content", ".help-content"]
}
```

### Cost-Controlled Crawl
```json
{
  "startUrls": ["https://example.com"],
  "maxPagesPerDomain": 50,
  "tokenLimit": 100000,
  "minContentLength": 200
}
```

## 📊 Output Format

### Standard Output
```json
{
  "url": "https://example.com/article",
  "title": "Understanding Machine Learning",
  "content": "# Understanding Machine Learning\n\nMachine learning is...",
  "wordCount": 1543,
  "tokenCount": 2104,
  "metadata": {
    "description": "A comprehensive guide to ML",
    "author": "John Doe",
    "publishDate": "2024-01-15",
    "tags": ["machine learning", "ai", "data science"],
    "crawledAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### Embedding-Ready Format
```json
{
  "embeddingReady": {
    "id": "aHR0cHM6Ly9leGFtcGxlLmNvbQ",
    "text": "Understanding Machine Learning\n\nMachine learning is...",
    "metadata": {
      "source": "https://example.com/article",
      "title": "Understanding Machine Learning",
      "tags": ["machine learning", "ai"]
    }
  }
}
```

### MCP Format
```json
{
  "mcp": {
    "type": "document",
    "source": "https://example.com/article",
    "title": "Understanding Machine Learning",
    "content": "# Understanding Machine Learning...",
    "tokens": 2104
  }
}
```

## 📥 Markdown File Downloads

In addition to the JSON dataset, the actor automatically generates downloadable Markdown files:

### Individual Page Files
Each collected page is saved as a separate `.md` file in the **Key-Value Store**:
- **Naming:** `page-0001.md`, `page-0002.md`, etc.
- **Format:** Clean markdown with metadata header
- **Use case:** Cherry-pick specific pages for training

**Example file structure:**
```markdown
# Understanding Machine Learning

**Source:** https://example.com/article
**Collected:** 2025-01-15T10:30:00.000Z

---

# Understanding Machine Learning

Machine learning is a subset of artificial intelligence...
```

### Combined Training File
All collected content merged into a single `TRAINING_DATA.md` file:
- **Location:** Key-Value Store → `TRAINING_DATA.md`
- **Format:** All pages concatenated with clear separators
- **Use case:** Bulk LLM training, RAG ingestion, fine-tuning datasets

**Example combined file:**
```markdown
# AI Training Data Collection

**Collection Date:** 2025-01-15T10:30:00.000Z
**Total Pages:** 26
**Total Tokens:** 93,986
**Total Words:** 62,421

---

<!-- Page 1 of 26 -->
# Understanding Machine Learning

**Source:** https://example.com/article
**Words:** 1,543 | **Tokens:** 2,104

---

Machine learning is a subset of artificial intelligence...

================================================================================

<!-- Page 2 of 26 -->
# Deep Learning Basics
...
```

### How to Download

1. **After run completes** → Go to **Storage** tab
2. **Click "Key-Value Store"**
3. **Download options:**
   - Individual files: Click any `page-XXXX.md`
   - Combined file: Click `TRAINING_DATA.md`
   - All files: Use "Download all" button

## 💰 Pricing Model

**Pay-per-token pricing:** $0.70 per 10,000 tokens

### Cost Examples
- **Small doc site** (50 pages, 500K tokens): $3.50
- **Medium blog** (200 pages, 2M tokens): $14.00
- **Large knowledge base** (1000 pages, 10M tokens): $70.00

### Cost Control Features
- Set `tokenLimit` to cap spending
- Use `minContentLength` to skip thin content
- Filter with `topicKeywords` to collect only relevant pages
- Monitor real-time token count in logs

## 🔧 MCP Integration

### Setup for Claude Desktop

1. **Install MCP Server**
```bash
npm install -g @apify/mcp-server-apify
```

2. **Add to Claude Config** (`~/Library/Application Support/Claude/config.json`):
```json
{
  "mcpServers": {
    "ai-data-collector": {
      "command": "npx",
      "args": ["-y", "@apify/mcp-server-apify", "ai-training-data-collector"],
      "env": {
        "APIFY_API_TOKEN": "your_apify_token_here"
      }
    }
  }
}
```

3. **Restart Claude**

4. **Use in Claude**
```
"Collect training data about React.js from reactjs.org documentation"
```

Claude will automatically call this actor and retrieve the data!

## 🛠️ Advanced Features

### Custom Content Selectors
For sites with specific structures:
```json
{
  "contentSelectors": [
    "article.post-content",
    ".documentation-body",
    "#main-content"
  ],
  "excludeSelectors": [
    ".comments-section",
    ".related-posts",
    ".advertisement"
  ]
}
```

### Multi-Domain Crawling
```json
{
  "startUrls": [
    "https://blog.company.com",
    "https://docs.company.com",
    "https://support.company.com"
  ],
  "crawlStrategy": "all",
  "maxPagesPerDomain": 200
}
```

### Topic-Focused Collection
```json
{
  "startUrls": ["https://news.ycombinator.com"],
  "topicKeywords": [
    "artificial intelligence",
    "machine learning",
    "llm",
    "gpt",
    "claude"
  ],
  "maxPagesPerDomain": 1000
}
```

## 📈 Performance

- **Crawl speed:** ~10 pages per second
- **Content cleaning:** Automatic removal of boilerplate
- **Token accuracy:** Uses official tiktoken encoder
- **Memory efficient:** Streams data to dataset

## 🔒 Best Practices

### 1. Respect robots.txt
The crawler automatically respects `robots.txt` directives.

### 2. Set Reasonable Limits
```json
{
  "maxPagesPerDomain": 500,
  "maxCrawlDepth": 3,
  "tokenLimit": 1000000
}
```

### 3. Use Topic Filtering
Reduce costs by collecting only relevant content:
```json
{
  "topicKeywords": ["your", "specific", "topics"]
}
```

### 4. Monitor Token Usage
Check logs for real-time token counts and cost estimates.

## 🐛 Troubleshooting

### No Content Extracted
- Check `contentSelectors` - may need site-specific selectors
- Verify site allows crawling (check robots.txt)
- Try different `crawlStrategy`

### Too Many Pages Skipped
- Lower `minContentLength` threshold
- Broaden `topicKeywords` or remove filtering
- Check `excludeSelectors` aren't removing main content

### High Costs
- Set `tokenLimit` to cap spending
- Reduce `maxPagesPerDomain`
- Use `topicKeywords` for targeted collection
- Increase `minContentLength` to skip thin pages

## 📚 Use with Popular Frameworks

### LangChain Integration
```python
from langchain.document_loaders import ApifyDatasetLoader

loader = ApifyDatasetLoader(
    dataset_id="your_dataset_id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["content"],
        metadata=item["metadata"]
    )
)
docs = loader.load()
```

### LlamaIndex Integration
```python
from llama_index import download_loader

ApifyLoader = download_loader("ApifyDataset")
loader = ApifyLoader("your_dataset_id")
documents = loader.load_data()
```

### ChromaDB Integration
```python
import chromadb

# Load dataset from Apify
dataset = apify_client.dataset("your_dataset_id").list_items().items

# Add to ChromaDB
for item in dataset:
    if "embeddingReady" in item:
        collection.add(
            documents=[item["embeddingReady"]["text"]],
            metadatas=[item["embeddingReady"]["metadata"]],
            ids=[item["embeddingReady"]["id"]]
        )
```

## 🎓 Examples & Tutorials

Coming soon:
- Building a RAG chatbot with collected data
- Fine-tuning GPT on custom datasets
- Creating domain-specific knowledge bases
- MCP integration patterns

## 📄 License

Apache-2.0

---

Collect high-quality training data. Build better AI systems.
