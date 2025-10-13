'use client'

interface StockInputProps {
  stockSymbol: string
  isLoading: boolean
  isAnalyzing: boolean
  onInputChange: (value: string) => void
  onAnalyze: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export default function StockInput({ 
  stockSymbol, 
  isLoading, 
  isAnalyzing, 
  onInputChange, 
  onAnalyze, 
  onKeyPress 
}: StockInputProps) {
  return (
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
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="AAPL, TSLA, GOOGL..."
            className="stock-input"
            disabled={isLoading}
          />
          <div className="input-glow"></div>
        </div>

        <button 
          className="analyze-btn" 
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !stockSymbol.trim()}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Stock'}
        </button>

        <div className="status">
          <span className="status-dot"></span>
          <span>
            {isLoading ? 'Fetching data...' : isAnalyzing ? 'AI is analyzing...' : 'Ready for market analysis'}
          </span>
        </div>
      </div>
    </section>
  )
}