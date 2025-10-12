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

export default function HomePage() {
  const [stockSymbol, setStockSymbol] = useState<string>('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stockData, setStockData] = useState<StockResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!stockSymbol.trim()) return
    
    setIsLoading(true)
    setError(null)
    
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
    console.log('📊 OHLC Data:', {
      open: dataPoint.open,
      high: dataPoint.high,
      low: dataPoint.low,
      close: dataPoint.close,
      volume: dataPoint.volume
    })
    
    // TODO: Later you'll call your agentic research API here
    // Example: await fetch(`/api/analysis/${stockSymbol}/${dataPoint.date}`)
    
    alert(`AI Analysis triggered for ${stockSymbol} on ${dataPoint.date}\n\nOHLC: $${dataPoint.open}/$${dataPoint.high}/$${dataPoint.low}/$${dataPoint.close}\nVolume: ${dataPoint.volume.toLocaleString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
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
                {isLoading ? 'Fetching data...' : 'Ready for market analysis'}
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

        </div>
      </div>
    </main>
  )
}