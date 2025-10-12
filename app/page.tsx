'use client'

import { useState } from 'react'
import StockChart from '@/components/StockChart'
import './homepage.css'
import './chart.css'

interface StockDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockResponse {
  symbol: string
  lastRefreshed: string
  data: StockDataPoint[]
}

interface AIAnalysisResult {
  symbol: string
  date: string
  analysis: string
  ohlcData: StockDataPoint
  metadata: {
    priceChange: number
    priceChangePercent: number
    dayRange: number
    isPositiveDay: boolean
    generatedAt: string
  }
}

export default function HomePage() {
  const [stockSymbol, setStockSymbol] = useState<string>('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stockData, setStockData] = useState<StockResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null) // 🔹 ADDED: AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false) // 🔹 ADDED: AI loading state

  const handleAnalyze = async () => {
    if (!stockSymbol.trim()) return
    
    setIsLoading(true)
    setError(null)
    setAiAnalysis(null) // 🔹 ADDED: Clear previous analysis
    
    try {
      const response = await fetch(`/api/stock/${stockSymbol.toUpperCase()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock data')
      }
      
      setStockData(data)
    } catch (err: any) {
      setError(err.message)
      setStockData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarClick = async (dataPoint: StockDataPoint) => {
    console.log('🤖 Clicked on date:', dataPoint.date)
    
    setIsAnalyzing(true) // 🔹 ADDED: Set AI loading state
    setError(null)
    
    try {
      // Call your new AI analysis API
      const response = await fetch(`/api/analysis/${stockData?.symbol}/${dataPoint.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ohlcData: {
            open: dataPoint.open,
            high: dataPoint.high,
            low: dataPoint.low,
            close: dataPoint.close,
            volume: dataPoint.volume
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI analysis')
      }

      const analysisResult = await response.json()
      
      console.log('🧠 AI Analysis Result:', analysisResult)
      
      setAiAnalysis(analysisResult) // 🔹 ADDED: Store AI analysis in state
      
    } catch (error) {
      console.error('Error getting AI analysis:', error)
      setError('Sorry, AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false) // 🔹 ADDED: Clear AI loading state
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  // 🔹 ADDED: AI Analysis Report Component
  const AIInsightsReport = ({ analysis }: { analysis: AIAnalysisResult }) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatPrice = (price: number) => `$${price.toFixed(2)}`
    const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`

    return (
      <div className="ai-insights-container">
        {/* Header */}
        <div className="insights-header">
          <div className="insights-title-wrapper">
            <div className="ai-icon">🤖</div>
            <div className="insights-title-content">
              <h3 className="insights-title">AI Market Insights</h3>
              <p className="insights-subtitle">
                Analysis for {analysis.symbol} • {formatDate(analysis.date)}
              </p>
            </div>
          </div>
          <div className="confidence-badge">
            <span className="confidence-label">AI Powered</span>
            <div className="confidence-indicator"></div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Price Movement</div>
            <div className={`metric-value ${analysis.metadata.isPositiveDay ? 'positive' : 'negative'}`}>
              {formatPrice(Math.abs(analysis.metadata.priceChange))}
              <span className="metric-percent">
                {formatPercent(analysis.metadata.priceChangePercent)}
              </span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Day Range</div>
            <div className="metric-value neutral">
              {formatPrice(analysis.metadata.dayRange)}
              <span className="metric-detail">H-L Spread</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Volume</div>
            <div className="metric-value neutral">
              {(analysis.ohlcData.volume / 1000000).toFixed(1)}M
              <span className="metric-detail">Shares</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Session Type</div>
            <div className={`metric-value ${analysis.metadata.isPositiveDay ? 'positive' : 'negative'}`}>
              {analysis.metadata.isPositiveDay ? 'Bullish' : 'Bearish'}
              <span className="metric-detail">Direction</span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="analysis-content">
          <div className="analysis-header">
            <h4 className="analysis-title">Market Intelligence</h4>
            <div className="analysis-timestamp">
              Generated {new Date(analysis.metadata.generatedAt).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="analysis-text">
            {analysis.analysis.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="analysis-paragraph">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="insights-footer">
          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span className="disclaimer-text">
              This analysis is AI-generated for informational purposes only. Not financial advice.
            </span>
          </div>
          <button 
            className="close-insights-btn"
            onClick={() => setAiAnalysis(null)}
          >
            Close Analysis
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="homepage">
      {/* Background */}
      <div className="background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        
        <div className="particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
        </div>
        
        <div className="grid-pattern"></div>
        <div className="scanning-lines">
          <div className="scan-line scan-1"></div>
          <div className="scan-line scan-2"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="container">
          
          {/* Header */}
          <header className="header">
            <div className="title-wrapper">
              <h1 className="title">VizAI</h1>
              <div className="title-underline"></div>
            </div>
            <p className="subtitle">
              Next-generation stock visualization powered by AI
            </p>
          </header>

          {/* Input Section */}
          <section className="input-section">
            <div className="input-container">
              <label className="input-label">
                <span className="label-dot"></span>
                Stock Symbol
              </label>
              
              <div className="input-wrapper">
                <input
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyPress={handleKeyPress}
                  placeholder="AAPL, TSLA, GOOGL..."
                  className={`stock-input ${isFocused ? 'focused' : ''}`}
                  disabled={isLoading}
                />
                <div className="input-glow"></div>
              </div>

              <button 
                className="analyze-btn" 
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || !stockSymbol.trim()}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Stock'}
              </button>

              <div className="status">
                <span className="status-dot"></span>
                {isLoading ? 'Fetching data...' : isAnalyzing ? 'AI is analyzing...' : 'Ready for market analysis'}
              </div>
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div className="error-container">
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Stock Chart */}
          {stockData && (
            <StockChart 
              data={stockData.data}
              symbol={stockData.symbol}
              onBarClick={handleBarClick}
            />
          )}

          {/* 🔹 ADDED: AI Analysis Loading State */}
          {isAnalyzing && (
            <div className="ai-loading-container">
              <div className="ai-loading-content">
                <div className="ai-loading-spinner"></div>
                <div className="ai-loading-text">
                  <h3>AI is analyzing market data...</h3>
                  <p>Processing price movements and market context</p>
                </div>
              </div>
            </div>
          )}

          {/* 🔹 ADDED: AI Insights Report */}
          {aiAnalysis && <AIInsightsReport analysis={aiAnalysis} />}

        </div>
      </div>
    </main>
  )
}