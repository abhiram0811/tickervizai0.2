import { NextRequest, NextResponse } from 'next/server'

interface StockDataPoint {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface AlphaVantageResponse {
    'Time Series (Daily)': {
        [date: string]: {
            '1. open': string
            '2. high': string
            '3. low': string
            '4. close': string
            '5. volume': string
        }
    }
    'Meta Data': {
        '2. Symbol': string
        '3. Last Refreshed': string
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }  // ✅ Now it's a Promise
) {
    try {
        const { symbol: rawSymbol } = await params  // ✅ Await the params
        const symbol = rawSymbol.toUpperCase()

        console.log(`🔍 Fetching data for symbol: ${symbol}`) // Debug log

        // Validate the stock symbol
        if (!symbol || symbol.length > 10) {
            return NextResponse.json(
                { error: 'Invalid Stock symbol' },
                { status: 400 }
            )
        }

        const apiKey = process.env.ALPHA_VANTAGE_API_KEY
        const baseUrl = process.env.ALPHA_VANTAGE_BASE_URL

        if (!apiKey) {
            console.log('❌ API key not found') // Debug log
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            )
        }

        // Fetch data from Alpha Vantage
        const url = `${baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
        console.log(`🌐 Fetching from URL: ${url.replace(apiKey, 'HIDDEN')}`) // Debug log

        const response = await fetch(url)
        const data: AlphaVantageResponse = await response.json()

        // 🔍 DEBUG: Log the raw response structure
        console.log('📊 Raw API Response Keys:', Object.keys(data))
        console.log('📊 Has Time Series:', !!data['Time Series (Daily)'])

        // Check if API returned an error
        if (!data['Time Series (Daily)']) {
            console.log('❌ No time series data found')
            return NextResponse.json(
                { error: 'Stock symbol not found or API limit reached' },
                { status: 404 }
            )
        }

        // Transform data for our frontend
        const timeSeries = data['Time Series (Daily)']
        console.log(`📈 Time series entries count: ${Object.keys(timeSeries).length}`)

        const stockData: StockDataPoint[] = Object.entries(timeSeries)
            .map(([date, values]) => ({
                date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseInt(values['5. volume'])
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30) // Get last 30 days

        console.log(`✅ Transformed ${stockData.length} data points`)
        console.log('📊 First data point:', stockData[0])
        console.log('📊 Last data point:', stockData[stockData.length - 1])

        const result = {
            symbol: data['Meta Data']['2. Symbol'],
            lastRefreshed: data['Meta Data']['3. Last Refreshed'],
            data: stockData
        }

        return NextResponse.json(result)

    } catch (error) {
        console.error('💥 Stock API Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stock data' },
            { status: 500 }
        )
    }
}