// This can be a Server Component - just static HTML with CSS animations
export default function AILoadingState() {
  return (
    <div className="ai-loading-container">
      <div className="ai-loading-content">
        <div className="ai-loading-spinner"></div>
        <div className="ai-loading-text">
          <h3>AI is analyzing market data...</h3>
          <p>Processing price movements and market context</p>
        </div>
      </div>
    </div>
  )
}