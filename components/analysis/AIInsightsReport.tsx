'use client'

interface AIAnalysisResult {
  symbol: string
  date: string
  analysis: string
  ohlcData: {
    open: number
    high: number
    low: number
    close: number
    volume: number
  }
  metadata: {
    priceChange: number
    priceChangePercent: number
    dayRange: number
    isPositiveDay: boolean
    generatedAt: string
  }
}

interface AIInsightsReportProps {
  analysis: AIAnalysisResult
  onClose: () => void
}

export default function AIInsightsReport({ analysis, onClose }: AIInsightsReportProps) {
  return (
    <div className="ai-insights-container">
      <div className="insights-header">
        <div className="insights-title-wrapper">
          <div className="ai-icon">🤖</div>
          <div className="insights-title-content">
            <h3 className="insights-title">AI Market Insights</h3>
            <p className="insights-subtitle">
              Analysis for {analysis.symbol} • {new Date(analysis.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="confidence-badge">
          <span className="confidence-label">AI Powered</span>
          <div className="confidence-indicator"></div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Price Movement</div>
          <div className={`metric-value ${analysis.metadata.isPositiveDay ? 'positive' : 'negative'}`}>
            ${Math.abs(analysis.metadata.priceChange).toFixed(2)}
            <span className="metric-percent">
              {analysis.metadata.priceChangePercent >= 0 ? '+' : ''}{analysis.metadata.priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Day Range</div>
          <div className="metric-value neutral">
            ${analysis.metadata.dayRange.toFixed(2)}
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

      <div className="insights-footer">
        <div className="disclaimer">
          <span className="disclaimer-icon">⚠️</span>
          <span className="disclaimer-text">
            This analysis is AI-generated for informational purposes only. Not financial advice.
          </span>
        </div>
        <button 
          className="close-insights-btn"
          onClick={onClose}
        >
          Close Analysis
        </button>
      </div>
    </div>
  )
}