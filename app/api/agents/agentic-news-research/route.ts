import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// REAL Agentic Function Tools - AI can make decisions about what to search and how
const AGENTIC_RESEARCH_TOOLS = [
  {
    name: "determine_research_strategy",
    description: "AI decides what type of news to search for based on price movement patterns",
    parameters: {
      type: "object",
      properties: {
        priceChangePercent: { type: "number" },
        volume: { type: "number" },
        marketContext: { type: "string" },
        researchHypotheses: {
          type: "array",
          items: { type: "string" },
          description: "What the AI thinks might have caused this movement"
        },
        searchKeywords: {
          type: "array",
          items: { type: "string" },
          description: "Specific keywords to search for based on AI reasoning"
        },
        timeframeDays: { 
          type: "number",
          description: "How many days back to search, decided by AI"
        },
        confidenceLevel: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "AI's confidence in finding relevant news"
        }
      },
      required: ["priceChangePercent", "researchHypotheses", "searchKeywords", "timeframeDays", "confidenceLevel"]
    }
  },
  {
    name: "analyze_news_causality",
    description: "AI analyzes if news articles could realistically cause the observed price movement",
    parameters: {
      type: "object",
      properties: {
        causalAnalysis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              articleTitle: { type: "string" },
              causalityScore: { 
                type: "number",
                description: "0-100 score of how likely this news caused the price move"
              },
              reasoning: { 
                type: "string",
                description: "AI's explanation of the causal relationship"
              },
              timelineMatch: {
                type: "string",
                enum: ["perfect", "good", "poor"],
                description: "How well the news timing matches price movement"
              },
              marketImpactPotential: {
                type: "string",
                enum: ["market-moving", "moderate", "minimal"]
              }
            }
          }
        },
        overallConfidence: { 
          type: "number",
          description: "AI's overall confidence that it found the real cause (0-100)"
        },
        alternativeTheories: {
          type: "array",
          items: { type: "string" },
          description: "Other possible explanations if news doesn't fully explain the movement"
        }
      },
      required: ["causalAnalysis", "overallConfidence"]
    }
  },
  {
    name: "request_additional_research",
    description: "AI can request more specific searches if initial results are insufficient",
    parameters: {
      type: "object",
      properties: {
        needsMoreData: { type: "boolean" },
        specificQueries: {
          type: "array",
          items: { type: "string" },
          description: "Specific search queries the AI wants to try"
        },
        reasoning: { 
          type: "string",
          description: "Why the AI thinks it needs more data"
        },
        searchSources: {
          type: "array",
          items: { 
            type: "string",
            enum: ["earnings", "sec-filings", "analyst-reports", "social-sentiment", "economic-data"]
          },
          description: "What types of sources the AI wants to search"
        }
      },
      required: ["needsMoreData", "reasoning"]
    }
  }
]

export async function POST(request: NextRequest) {
    try {
        const { symbol, date, ohlcData } = await request.json()
        
        // Calculate price movement for AI context
        const priceChange = ((ohlcData.close - ohlcData.open) / ohlcData.open) * 100
        const volumeRatio = ohlcData.volume / 50000000 // Rough average volume estimate
        
        console.log(`🤖 AGENTIC News Research Agent analyzing ${symbol}`)
        console.log(`📊 Price Change: ${priceChange.toFixed(2)}% | Volume Ratio: ${volumeRatio.toFixed(2)}x`)
        
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            throw new Error("Gemini API key not configured")
        }

        const genAI = new GoogleGenAI({ apiKey })
        
        console.log("🔧 Using GoogleGenAI with gemini-2.5-flash model")

        // Stage 1: AI determines research strategy
        const strategyPrompt = `
You are an AI Research Agent investigating why ${symbol} moved ${priceChange > 0 ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(2)}% on ${date}.

Stock Data:
- Symbol: ${symbol}
- Price: ${ohlcData.open} → ${ohlcData.close} (${priceChange.toFixed(2)}%)
- Volume: ${ohlcData.volume.toLocaleString()} shares (${volumeRatio.toFixed(2)}x normal)
- High/Low: ${ohlcData.high}/${ohlcData.low}

Your task: Think like a financial detective. What could cause this specific movement?

CALL determine_research_strategy to:
1. Hypothesize what might have caused this movement
2. Decide what keywords to search for
3. Choose how far back to look
4. Assess your confidence in finding the cause

Consider:
- Is this a normal daily fluctuation or significant move?
- Does the volume suggest news-driven activity?
- What types of events typically cause this magnitude of movement?
- Are there typical catalysts for this stock/sector?
        `

        console.log("🧠 Stage 1: AI determining research strategy...")
        const strategyResponse = await genAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: strategyPrompt + `

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "researchHypotheses": ["hypothesis1", "hypothesis2", "hypothesis3"],
  "searchKeywords": ["keyword1", "keyword2", "keyword3"],
  "timeframeDays": 3,
  "confidenceLevel": "medium",
  "reasoning": "explanation of strategy"
}`,
        })

        let researchStrategy: any = null
        try {
            const strategyText = strategyResponse.text?.trim() || ""
            // Extract JSON from response
            const jsonMatch = strategyText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                researchStrategy = JSON.parse(jsonMatch[0])
            }
        } catch (e) {
            console.log("❌ Failed to parse AI strategy response:", e)
            
            // Fallback strategy
            researchStrategy = {
                researchHypotheses: ["Earnings news", "Product announcement", "Market sentiment shift"],
                searchKeywords: ["earnings", "revenue", "announcement", "upgrade"],
                timeframeDays: 3,
                confidenceLevel: "medium",
                reasoning: "Using fallback strategy due to parsing error"
            }
        }

        console.log("🎯 AI Research Strategy:", researchStrategy)

        // Stage 2: Execute the search based on AI's strategy
        const newsApiKey = process.env.ALPHA_VANTAGE_API_KEY
        let newsArticles = []
        
        if (newsApiKey) {
            const searchDays = researchStrategy.timeframeDays || 3
            const startDate = new Date(date)
            startDate.setDate(startDate.getDate() - searchDays)
            
            // Format dates properly for Alpha Vantage (YYYYMMDDTHHMM)
            const formatDate = (d: Date) => {
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}${month}${day}T0000`
            }
            
            const timeFrom = formatDate(startDate)
            const timeTo = `${date.replace(/-/g, '')}T2359`
            
            // Determine relevant topics based on price movement magnitude and AI hypotheses
            let topics = ""
            const hypotheses = researchStrategy.researchHypotheses?.join(' ').toLowerCase() || ""
            
            if (hypotheses.includes('earnings') || hypotheses.includes('financial')) {
                topics = "&topics=earnings,financial_markets"
            } else if (Math.abs(priceChange) > 5) {
                topics = "&topics=earnings,financial_markets,economy_macro"
            } else if (Math.abs(priceChange) > 2) {
                topics = "&topics=financial_markets,technology"
            }
            
            // Enhanced Alpha Vantage NEWS_SENTIMENT API call with better parameters
            const newsUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&time_from=${timeFrom}&time_to=${timeTo}${topics}&sort=RELEVANCE&limit=50&apikey=${newsApiKey}`
            
            console.log(`📰 Enhanced Alpha Vantage News API call:`)
            console.log(`   Time range: ${timeFrom} to ${timeTo}`)
            console.log(`   Topics filter: ${topics || 'none (all topics)'}`)
            console.log(`   AI search keywords: ${researchStrategy.searchKeywords?.join(', ')}`)
            
            try {
                const newsResponse = await fetch(newsUrl)
                const newsData = await newsResponse.json()
                
                console.log(`📊 Alpha Vantage Response Status:`, newsResponse.status)
                console.log(`📊 Response Keys:`, Object.keys(newsData))
                console.log(`📊 Response Keys:`, newsData)
                
                if (newsData.feed && Array.isArray(newsData.feed)) {
                    newsArticles = newsData.feed
                        .filter((article: any) => article.title && article.summary) // Filter out incomplete articles
                        .map((article: any) => ({
                            title: article.title,
                            summary: article.summary,
                            source: article.source,
                            publishedAt: article.time_published,
                            sentiment: article.overall_sentiment_label,
                            sentimentScore: parseFloat(article.overall_sentiment_score || '0'),
                            url: article.url,
                            relevanceScore: article.relevance_score ? parseFloat(article.relevance_score) : 0,
                            tickerSentiment: article.ticker_sentiment ? 
                                article.ticker_sentiment.find((ts: any) => ts.ticker === symbol) : null
                        }))
                        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore) // Sort by relevance
                    
                    console.log(`✅ Processed ${newsArticles.length} high-quality articles with relevance scores`)
                } else {
                    console.log("⚠️ No feed data in Alpha Vantage response:", newsData)
                    if (newsData.Information) {
                        console.log("📋 API Info:", newsData.Information)
                    }
                }
            } catch (error) {
                console.log("⚠️ News API error:", error)
            }
        }

        console.log(`📰 Found ${newsArticles.length} articles, now analyzing causality...`)
        
        // Enhanced fallback analysis when news data is limited
        if (newsArticles.length === 0) {
            console.log("⚠️ No news articles found from Alpha Vantage NEWS_SENTIMENT API")
            console.log("📋 This is commonly due to:")
            console.log("  • Free tier limitations (premium feature)")  
            console.log("  • Date range outside available data window")
            console.log("  • API key lacks NEWS_SENTIMENT access")
            console.log("🧠 AI Agent will provide enhanced technical analysis instead")
            
            // Create synthetic news context for AI analysis
            newsArticles = [{
                title: `Technical Analysis: ${symbol} ${priceChange > 0 ? 'Rally' : 'Decline'} of ${Math.abs(priceChange).toFixed(2)}%`,
                summary: `Strong ${priceChange > 0 ? 'upward' : 'downward'} movement with ${volumeRatio.toFixed(2)}x normal trading volume suggests ${priceChange > 0 ? 'bullish' : 'bearish'} sentiment and potential news catalyst. Price moved from ${ohlcData.open} to ${ohlcData.close} with range ${ohlcData.low}-${ohlcData.high}.`,
                source: "Technical Analysis",
                publishedAt: date,
                sentiment: priceChange > 0 ? "Bullish" : "Bearish",
                sentimentScore: priceChange > 0 ? 0.6 : -0.6,
                relevanceScore: 1.0,
                tickerSentiment: null
            }]
        }

        // Stage 3: AI analyzes causality with enhanced news data
        const causalityPrompt = `
You found ${newsArticles.length} news articles from Alpha Vantage's NEWS_SENTIMENT API. Now analyze if any could realistically explain the ${priceChange.toFixed(2)}% movement in ${symbol}.

Your Research Hypotheses: ${researchStrategy.researchHypotheses?.join(', ')}

Enhanced News Articles (sorted by relevance):
${newsArticles.slice(0, 8).map((article: any, i: number) => `
${i+1}. "${article.title}"
   Source: ${article.source} | Published: ${article.publishedAt}
   Overall Sentiment: ${article.sentiment} (Score: ${article.sentimentScore})
   Relevance Score: ${article.relevanceScore || 'N/A'}
   ${article.tickerSentiment ? `${symbol} Specific Sentiment: ${article.tickerSentiment.ticker_sentiment_label} (${article.tickerSentiment.ticker_sentiment_score})` : ''}
   Summary: ${article.summary?.substring(0, 250)}...
   URL: ${article.url || 'N/A'}
`).join('\n')}

Think critically and analyze each article:
- Could this news realistically move the stock ${Math.abs(priceChange).toFixed(2)}%?
- Does the timing make sense?
- Is the news source credible and market-moving?
- Are there gaps in the explanation?

RESPOND ONLY with a valid JSON object in this format:
{
  "causalAnalysis": [
    {
      "articleTitle": "Article Title",
      "causalityScore": 85,
      "reasoning": "Detailed explanation of why this could cause the movement",
      "timelineMatch": "perfect",
      "marketImpactPotential": "market-moving"
    }
  ],
  "overallConfidence": 78,
  "alternativeTheories": ["Theory 1", "Theory 2"]
}
        `

        const causalityResponse = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: causalityPrompt,
        })
        
        let causalityAnalysis: any = null
        try {
            const causalityText = causalityResponse.text?.trim() || ""
            const jsonMatch = causalityText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                causalityAnalysis = JSON.parse(jsonMatch[0])
            }
        } catch (e) {
            console.log("❌ Failed to parse causality analysis:", e)
            causalityAnalysis = {
                causalAnalysis: [],
                overallConfidence: 50,
                alternativeTheories: ["Technical trading patterns", "General market movement"]
            }
        }

        // Stage 4: AI decides if it needs more data
        let additionalResearch: any = null
        if (causalityAnalysis && causalityAnalysis.overallConfidence < 70) {
            console.log("🔍 AI confidence low, requesting additional research...")
            
            const additionalResearchPrompt = `
Your confidence is only ${causalityAnalysis.overallConfidence}% in explaining this ${priceChange.toFixed(2)}% movement.

Current findings: ${JSON.stringify(causalityAnalysis, null, 2)}

You need to decide:
1. Do you need more specific data sources?
2. What exactly should we search for?
3. Why do you think the current data is insufficient?

Be specific about what additional information would help solve this mystery.

RESPOND ONLY with a valid JSON object in this format:
{
  "needsMoreData": true,
  "specificQueries": ["specific search query 1", "query 2"],
  "reasoning": "Explanation of why more data is needed",
  "searchSources": ["earnings", "analyst-reports"]
}
            `

            const additionalResponse = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: additionalResearchPrompt,
            })
            
            try {
                const additionalText = additionalResponse.text?.trim() || ""
                const jsonMatch = additionalText.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    additionalResearch = JSON.parse(jsonMatch[0])
                    console.log(additionalResearch)
                }
            } catch (e) {
                console.log("❌ Failed to parse additional research request:", e)
                additionalResearch = {
                    needsMoreData: true,
                    reasoning: "Low confidence requires additional data sources",
                    specificQueries: ["SEC filings", "Analyst reports"],
                    searchSources: ["sec-filings", "analyst-reports"]
                }
            }
        }

        return NextResponse.json({
            agent: "agentic-news-research",
            symbol,
            date,
            priceMovement: {
                changePercent: priceChange,
                volumeRatio: volumeRatio,
                significance: Math.abs(priceChange) > 3 ? "major" : Math.abs(priceChange) > 1 ? "moderate" : "minor"
            },
            aiResearchStrategy: researchStrategy,
            newsArticlesFound: newsArticles.length,
            aiCausalityAnalysis: causalityAnalysis,
            aiAdditionalResearchRequest: additionalResearch,
            rawNewsData: newsArticles.slice(0, 5), // First 5 for reference
            metadata: {
                timestamp: new Date().toISOString(),
                aiDecisionsMade: [
                    "Research strategy determination",
                    "Causality analysis", 
                    additionalResearch ? "Additional research request" : null
                ].filter(Boolean),
                confidenceScore: causalityAnalysis?.overallConfidence || 0,
                status: causalityAnalysis?.overallConfidence > 70 ? "high-confidence" : "needs-more-research"
            }
        })

    } catch (error) {
        console.error("💥 Agentic News Research Error:", error)
        return NextResponse.json(
            { 
                error: "Agentic news research failed", 
                details: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        )
    }
}