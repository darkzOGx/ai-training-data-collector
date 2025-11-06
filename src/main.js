import { Actor } from 'apify';
import { CheerioCrawler, KeyValueStore } from 'crawlee';
import { readFile } from 'fs/promises';
import TurndownService from 'turndown';
import { encodingForModel } from 'js-tiktoken';
import keyword from 'keyword-extractor';
import { removeStopwords } from 'stopword';

// Initialize token counter for GPT-4 (tiktoken)
const encoding = encodingForModel('gpt-4');

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
});

// Remove unwanted elements
turndownService.remove(['script', 'style', 'iframe', 'noscript']);

/**
 * Count tokens in text using tiktoken
 */
function countTokens(text) {
    try {
        if (!text || typeof text !== 'string') {
            return 0;
        }
        const tokens = encoding.encode(text);
        if (!tokens || !Array.isArray(tokens)) {
            // Fallback: rough estimate (1 token ≈ 4 characters)
            return Math.ceil(text.length / 4);
        }
        return tokens.length;
    } catch (error) {
        // Fallback: rough estimate (1 token ≈ 4 characters)
        return Math.ceil(text.length / 4);
    }
}

/**
 * Extract keywords from text using NLP
 */
function extractKeywords(text, limit = 10) {
    try {
        const extracted = keyword.extract(text, {
            language: 'english',
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true
        });

        return extracted.slice(0, limit);
    } catch (error) {
        console.warn('Keyword extraction failed:', error.message);
        return [];
    }
}

/**
 * Check if content matches topic keywords
 */
function matchesTopics(text, topicKeywords) {
    if (!topicKeywords || topicKeywords.length === 0) return true;

    const lowerText = text.toLowerCase();
    return topicKeywords.some(keyword =>
        lowerText.includes(keyword.toLowerCase())
    );
}

/**
 * Clean and extract main content from HTML
 */
function extractMainContent($, excludeSelectors, contentSelectors) {
    // Remove excluded elements
    excludeSelectors.forEach(selector => {
        try {
            $(selector).remove();
        } catch (e) {
            // Ignore invalid selectors
        }
    });

    // Try to find main content using selectors
    let mainContent = null;

    if (contentSelectors && contentSelectors.length > 0) {
        for (const selector of contentSelectors) {
            try {
                const content = $(selector);
                if (content.length > 0) {
                    mainContent = content;
                    break;
                }
            } catch (e) {
                // Ignore invalid selectors
            }
        }
    }

    // Fallback: auto-detect main content
    if (!mainContent || mainContent.length === 0) {
        // Try common content containers
        const commonSelectors = [
            'article',
            '[role="main"]',
            'main',
            '.content',
            '.post-content',
            '.entry-content',
            '#content',
            '.article-content'
        ];

        for (const selector of commonSelectors) {
            const content = $(selector);
            if (content.length > 0) {
                mainContent = content;
                break;
            }
        }

        // Last resort: use body
        if (!mainContent || mainContent.length === 0) {
            mainContent = $('body');
        }
    }

    return mainContent.html() || '';
}

/**
 * Count words in text
 */
function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

await Actor.main(async () => {
    // Get input or fallback to local file
    let input = await Actor.getInput();

    if (!input) {
        console.log('No Apify input found, reading from local input.json...');
        try {
            const inputFile = await readFile('./input.json', 'utf-8');
            input = JSON.parse(inputFile);
        } catch (error) {
            throw new Error('Could not read input from Apify or local input.json file');
        }
    }

    // Validate inputs
    if (!input.startUrls || input.startUrls.length === 0) {
        throw new Error('No start URLs provided');
    }

    // Set defaults
    const {
        startUrls,
        crawlStrategy = 'same-domain',
        maxCrawlDepth = 3,
        maxPagesPerDomain = 100,
        topicKeywords = [],
        contentSelectors = [],
        excludeSelectors = ['nav', 'header', 'footer', '.advertisement', '.sidebar', '.comments'],
        outputFormat = 'markdown',
        includeMetadata = true,
        autoTagging = true,
        minContentLength = 100,
        tokenLimit = null,
        embeddings = false,
        mcpCompatible = true
    } = input;

    console.log(`🚀 Starting AI Training Data Collector`);
    console.log(`   Start URLs: ${startUrls.length}`);
    console.log(`   Max pages per domain: ${maxPagesPerDomain}`);
    console.log(`   Crawl depth: ${maxCrawlDepth}`);
    console.log(`   Topic filtering: ${topicKeywords.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   Output format: ${outputFormat}`);

    let totalTokens = 0;
    let pagesCollected = 0;
    let pagesSkipped = 0;

    // Create crawler
    const crawler = new CheerioCrawler({
        maxRequestsPerCrawl: maxPagesPerDomain,
        maxConcurrency: 10,
        requestHandlerTimeoutSecs: 60,

        async requestHandler({ request, $, enqueueLinks }) {
            const { url } = request;

            console.log(`📄 Processing: ${url}`);

            // Extract main content
            const htmlContent = extractMainContent($, excludeSelectors, contentSelectors);

            if (!htmlContent) {
                console.log(`   ⚠️  No content found, skipping`);
                pagesSkipped++;
                return;
            }

            // Convert to desired format
            let content;
            let plainText;

            if (outputFormat === 'markdown') {
                content = turndownService.turndown(htmlContent);
                plainText = content.replace(/[#*_\[\]()]/g, ' '); // Remove markdown syntax for analysis
            } else if (outputFormat === 'plain-text') {
                content = $.text();
                plainText = content;
            } else {
                // structured-json - use markdown as the content format
                content = turndownService.turndown(htmlContent);
                plainText = $.text();
            }

            // Count words
            const wordCount = countWords(plainText);

            // Check minimum length
            if (wordCount < minContentLength) {
                console.log(`   ⚠️  Content too short (${wordCount} words), skipping`);
                pagesSkipped++;
                return;
            }

            // Check topic match
            if (!matchesTopics(plainText, topicKeywords)) {
                console.log(`   ⚠️  Content doesn't match topic keywords, skipping`);
                pagesSkipped++;
                return;
            }

            // Extract metadata
            const title = $('title').text() || $('h1').first().text() || 'Untitled';
            const metaDescription = $('meta[name="description"]').attr('content') || '';
            const author = $('meta[name="author"]').attr('content') ||
                          $('[rel="author"]').text() ||
                          $('[itemprop="author"]').text() || '';

            // Extract publication date
            const dateSelectors = [
                'meta[property="article:published_time"]',
                'meta[name="publish-date"]',
                'time[datetime]',
                '.published-date',
                '.post-date'
            ];

            let publishDate = '';
            for (const selector of dateSelectors) {
                const dateEl = $(selector);
                if (dateEl.length > 0) {
                    publishDate = dateEl.attr('content') || dateEl.attr('datetime') || dateEl.text();
                    break;
                }
            }

            // Auto-tagging
            let tags = [];
            if (autoTagging) {
                tags = extractKeywords(plainText, 10);
                console.log(`   🏷️  Auto-tags: ${tags.join(', ')}`);
            }

            // Count tokens
            const tokens = countTokens(content);
            totalTokens += tokens;

            console.log(`   ✅ Collected ${wordCount} words (${tokens} tokens)`);

            // Build output object
            const output = {
                url,
                title,
                content,
                wordCount,
                tokenCount: tokens
            };

            // Add metadata if requested
            if (includeMetadata) {
                output.metadata = {
                    description: metaDescription,
                    author,
                    publishDate,
                    tags,
                    crawledAt: new Date().toISOString()
                };
            }

            // Add embedding format if requested
            if (embeddings) {
                output.embeddingReady = {
                    id: Buffer.from(url).toString('base64').substring(0, 32),
                    text: content,
                    metadata: {
                        source: url,
                        title,
                        tags
                    }
                };
            }

            // MCP-compatible format
            if (mcpCompatible) {
                output.mcp = {
                    type: 'document',
                    source: url,
                    title,
                    content,
                    tokens
                };
            }

            // Save to dataset
            await Actor.pushData(output);
            pagesCollected++;

            // Check token limit
            if (tokenLimit && totalTokens >= tokenLimit) {
                console.log(`\n🛑 Token limit reached (${totalTokens}/${tokenLimit}), stopping crawler`);
                throw new Error('TOKEN_LIMIT_REACHED');
            }

            // Enqueue links based on strategy
            if (request.userData.depth < maxCrawlDepth) {
                await enqueueLinks({
                    strategy: crawlStrategy,
                    userData: { depth: (request.userData.depth || 0) + 1 }
                });
            }
        },

        failedRequestHandler({ request }) {
            console.log(`❌ Failed: ${request.url}`);
        }
    });

    // Process start URLs
    const requests = startUrls.map(url => ({
        url: typeof url === 'string' ? url : url.url,
        userData: { depth: 0 }
    }));

    try {
        await crawler.run(requests);
    } catch (error) {
        if (error.message !== 'TOKEN_LIMIT_REACHED') {
            throw error;
        }
    }

    // Final summary
    console.log(`\n✅ Crawl Complete!`);
    console.log(`   Pages collected: ${pagesCollected}`);
    console.log(`   Pages skipped: ${pagesSkipped}`);
    console.log(`   Total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`   Cost estimate: $${((totalTokens / 10000) * 5).toFixed(2)} (at $5 per 10K tokens)`);

    // Save summary to key-value store
    await Actor.setValue('SUMMARY', {
        pagesCollected,
        pagesSkipped,
        totalTokens,
        costEstimate: ((totalTokens / 10000) * 5).toFixed(2),
        completedAt: new Date().toISOString()
    });
});
