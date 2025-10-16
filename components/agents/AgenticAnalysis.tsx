'use client'

import { useState, useEffect } from 'react'

interface AgenticAnalysisProps {
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

interface AgenticResult {
    agent: string
    aiResearchStrategy: any
    aiCausalityAnalysis: any
    aiAdditionalResearchRequest: any
    metadata: any
    error?: string
}

export default function AgenticAnalysis({ symbol, date, ohlcData }: AgenticAnalysisProps) {
    const [result, setResult] = useState<AgenticResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // 🔹 ADDED: Reset state when props change (new stock or date selected)
    useEffect(() => {
        setResult(null)
        setIsLoading(false)
    }, [symbol, date])

    const runAgenticAnalysis = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/agents/agentic-news-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, date, ohlcData })
            })
            
            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ 
                agent: 'agentic-news-research', 
                aiResearchStrategy: null,
                aiCausalityAnalysis: null,
                aiAdditionalResearchRequest: null,
                metadata: {},
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const priceChange = ((ohlcData.close - ohlcData.open) / ohlcData.open) * 100

    return (
        <div className="agentic-inline-container">
            {/* Stock Data Summary */}
            <div className="agentic-price-summary">
                <h3>📊 Price Movement Analysis</h3>
                <div className="agentic-price-grid">
                    <div className="agentic-price-card">
                        <div className="agentic-price-label">Price Change</div>
                        <div className={`agentic-price-value ${priceChange >= 0 ? 'agentic-price-positive' : 'agentic-price-negative'}`}>
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </div>
                    </div>
                    <div className="agentic-price-card">
                        <div className="agentic-price-label">Volume</div>
                        <div className="agentic-price-value agentic-price-neutral">
                            {(ohlcData.volume / 1000000).toFixed(1)}M
                        </div>
                    </div>
                    <div className="agentic-price-card">
                        <div className="agentic-price-label">Range</div>
                        <div className="agentic-price-value agentic-price-neutral">
                            ${ohlcData.low.toFixed(2)} - ${ohlcData.high.toFixed(2)}
                        </div>
                    </div>
                    <div className="agentic-price-card">
                        <div className="agentic-price-label">Close</div>
                        <div className="agentic-price-value agentic-price-neutral">
                            ${ohlcData.close.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Button */}
            {!result && !isLoading && (
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <button 
                        onClick={runAgenticAnalysis}
                        className="agentic-button"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '20px' }}>🚀</span>
                            Start AI Research Analysis
                        </div>
                    </button>
                </div>
            )}

            {/* Chic Loading State */}
            {isLoading && (
                <div className="agentic-loading-minimalist">
                    <div className="agentic-pulse-dots">
                        <div className="agentic-pulse-dot"></div>
                        <div className="agentic-pulse-dot"></div>
                        <div className="agentic-pulse-dot"></div>
                    </div>
                    <p className="agentic-loading-minimal-text">🧠 AI Agent analyzing market patterns...</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* AI Research Strategy */}
                    {result?.aiResearchStrategy && (
                        <div className="agentic-section">
                            <h3 className="agentic-section-title">
                                <span>🎯</span>
                                AI Research Strategy
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {result.aiResearchStrategy.researchHypotheses && (
                                    <div className="agentic-strategy-item">
                                        <h4 className="agentic-item-title">🧠 AI's Hypotheses:</h4>
                                        <div className="agentic-item-content">
                                            {result.aiResearchStrategy.researchHypotheses.map((hypothesis: string, i: number) => (
                                                <div key={i} style={{ marginBottom: '8px' }}>
                                                    <span style={{ color: 'rgb(34, 211, 238)' }}>#{i + 1}:</span> {hypothesis}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {result?.aiResearchStrategy?.reasoning && (
                                    <div className="agentic-strategy-item">
                                        <h4 className="agentic-item-title">🤔 AI Reasoning:</h4>
                                        <div className="agentic-item-content">{result.aiResearchStrategy.reasoning}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {result?.error && (
                        <div className="agentic-error">
                            <h3>❌ Error</h3>
                            <p>{result?.error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}