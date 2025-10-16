'use client'

interface StockInputProps {
  stockSymbol: string
  isLoading: boolean
  isAnalyzing: boolean
  onInputChange: (value: string) => void
  onAnalyze: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function StockInput({ 
  stockSymbol, 
  isLoading, 
  isAnalyzing, 
  onInputChange, 
  onAnalyze, 
  onKeyDown 
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
            onKeyDown={onKeyDown}
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