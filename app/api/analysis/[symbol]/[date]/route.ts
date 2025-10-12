import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

interface AnalysisRequest {
    symbol: string
    date: string
    ohlcData: {
        open: number
        high: number
        low: number
        close: number
        volume: number
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ symbol: string; date: string }> }
) {
    try {
        const { symbol, date } = await params
        const body = await request.json()

        console.log(`🤖 AI Analysis requested for ${symbol} on ${date}`)

        // Get Gemini API key
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            )
        }

        // Initialize Gemini
        const genAI = new GoogleGenAI({ apiKey })

        // Extract OHLC data from request
        const { ohlcData } = body

        // Create a simple prompt for analysis
        const prompt = `
        You are a professional stock market analyst. Analyze the following stock data:

        Stock: ${symbol}
        Date: ${date}

        Price Data:
        - Opening Price: $${ohlcData.open}
        - Highest Price: $${ohlcData.high}
        - Lowest Price: $${ohlcData.low}
        - Closing Price: $${ohlcData.close}
        - Volume: ${ohlcData.volume.toLocaleString()} shares

        Price Movement: ${ohlcData.close > ohlcData.open ? "UP" : "DOWN"} ${Math.abs(((ohlcData.close - ohlcData.open) / ohlcData.open) * 100).toFixed(2)}%

        Please provide:
        1. A brief analysis of this trading day's price action
        2. What the volume might indicate
        3. Possible reasons for this price movement (general market factors)
        4. Key technical observations

        Keep your response concise but insightful, around 200-300 words.
        Use a professional but accessible tone.
        `

        console.log("🧠 Sending prompt to Gemini...")
        // Generate analysis
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash", // Using latest model
            contents: prompt,
        })

        const analysis = response.text

        console.log("✅ Gemini analysis completed")

        // Return the analysis
        return NextResponse.json({
            symbol,
            date,
            analysis,
            ohlcData,
            metadata: {
                priceChange: ohlcData.close - ohlcData.open,
                priceChangePercent: ((ohlcData.close - ohlcData.open) / ohlcData.open) * 100,
                dayRange: ohlcData.high - ohlcData.low,
                isPositiveDay: ohlcData.close >= ohlcData.open,
                generatedAt: new Date().toISOString(),
            },
        })

    } catch (error) {
        console.error("💥 AI Analysis Error:", error)
        return NextResponse.json(
            { error: "Failed to generate AI analysis" },
            { status: 500 }
        )
    }
}