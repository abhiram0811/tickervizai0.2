'use client'

import { useState } from 'react'

interface AgenticTestResult {
    agent: string
    aiResearchStrategy: any
    aiCausalityAnalysis: any
    aiAdditionalResearchRequest: any
    metadata: any
    error?: string
}

export default function AgenticNewsResearchTester() {
    const [result, setResult] = useState<AgenticTestResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Test with a significant price movement
    const testData = {
        symbol: "AAPL",
        date: "2024-10-11",
        ohlcData: {
            open: 150.00,
            high: 158.25,  // Big move up
            low: 149.50,
            close: 156.80,  // +4.5% gain
            volume: 85000000  // High volume
        }
    }

    const testAgenticAgent = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/agents/agentic-news-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
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

    return (
        <div className="agentic-container">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <span className="text-2xl">🤖</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">AGENTIC News Research Agent</h2>
                    <p className="text-cyan-400 text-sm">
                        AI makes autonomous research decisions, analyzes causality, and requests additional data
                    </p>
                </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h3 className="text-cyan-300 font-semibold mb-2">📊 Test Scenario: Significant Price Movement</h3>
                <div className="bg-black/30 p-3 rounded-lg">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify({
                            ...testData,
                            priceChange: "+4.5%",
                            scenario: "Big gain with high volume - What caused this?"
                        }, null, 2)}
                    </pre>
                </div>
            </div>

            <button 
                onClick={testAgenticAgent}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        🧠 AI Agent Thinking...
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        🚀 Analyze with AI Agent
                    </div>
                )}
            </button>

            {result && (
                <div className="mt-4 space-y-4">
                    {/* AI Research Strategy */}
                    {result.aiResearchStrategy && (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-6 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🎯</span>
                                <h3 className="text-xl font-bold text-yellow-400">AI Research Strategy</h3>
                            </div>
                            <div className="space-y-4 text-sm">
                                {result.aiResearchStrategy.researchHypotheses && (
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-white mb-2">🧠 AI's Hypotheses:</h4>
                                        <ul className="space-y-2">
                                            {result.aiResearchStrategy.researchHypotheses.map((hypothesis: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-6 h-6 bg-cyan-500 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-cyan-300">{hypothesis}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {result.aiResearchStrategy.searchKeywords && (
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-white mb-2">🔍 AI Chose Keywords:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.aiResearchStrategy.searchKeywords.map((keyword: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="bg-black/20 p-3 rounded-lg">
                                        <span className="text-gray-400">Search Timeframe:</span>
                                        <span className="ml-2 text-white font-semibold">{result.aiResearchStrategy.timeframeDays} days back</span>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-lg">
                                        <span className="text-gray-400">AI Confidence:</span>
                                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                                            result.aiResearchStrategy.confidenceLevel === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                            result.aiResearchStrategy.confidenceLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                            'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                            {result.aiResearchStrategy.confidenceLevel.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Causality Analysis */}
                    {result.aiCausalityAnalysis && (
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-6 rounded-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🔍</span>
                                <h3 className="text-xl font-bold text-green-400">AI Causality Analysis</h3>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="bg-black/20 p-4 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-gray-400 text-sm mb-1">Overall Confidence</div>
                                        <div className="text-4xl font-bold text-white">
                                            {result.aiCausalityAnalysis.overallConfidence}%
                                        </div>
                                        <div className={`w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden`}>
                                            <div 
                                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
                                                style={{ width: `${result.aiCausalityAnalysis.overallConfidence}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {result.aiCausalityAnalysis.causalAnalysis && result.aiCausalityAnalysis.causalAnalysis.length > 0 && (
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-white mb-3">📰 Article Analysis:</h4>
                                        <div className="max-h-64 overflow-y-auto space-y-3">
                                            {result.aiCausalityAnalysis.causalAnalysis.slice(0, 3).map((analysis: any, i: number) => (
                                                <div key={i} className="bg-gray-800/50 border border-gray-600/30 p-4 rounded-lg">
                                                    <div className="font-semibold text-white mb-2">{analysis.articleTitle}</div>
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">Causality Score:</span>
                                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm font-bold">
                                                                {analysis.causalityScore}/100
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">Timeline:</span>
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                analysis.timelineMatch === 'perfect' ? 'bg-green-500/20 text-green-300' :
                                                                analysis.timelineMatch === 'good' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-red-500/20 text-red-300'
                                                            }`}>
                                                                {analysis.timelineMatch}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-300 text-xs mb-2 leading-relaxed">
                                                        {analysis.reasoning}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-400">Impact:</span>
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            analysis.marketImpactPotential === 'market-moving' ? 'bg-purple-500/20 text-purple-300' :
                                                            analysis.marketImpactPotential === 'moderate' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-gray-500/20 text-gray-300'
                                                        }`}>
                                                            {analysis.marketImpactPotential}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.aiCausalityAnalysis.alternativeTheories && (
                                    <div className="bg-black/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-white mb-2">🤔 AI's Alternative Theories:</h4>
                                        <ul className="space-y-2">
                                            {result.aiCausalityAnalysis.alternativeTheories.map((theory: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-5 h-5 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-orange-300">{theory}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Additional Research Request */}
                    {result.aiAdditionalResearchRequest && (
                        <div className="bg-gray-800 p-4 rounded border-l-4 border-red-500">
                            <h3 className="text-red-400 mb-2">🔄 AI Requests More Data:</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>Reasoning:</strong> {result.aiAdditionalResearchRequest.reasoning}</div>
                                {result.aiAdditionalResearchRequest.specificQueries && (
                                    <div>
                                        <strong>Specific Queries AI Wants:</strong>
                                        <ul className="ml-4 list-disc">
                                            {result.aiAdditionalResearchRequest.specificQueries.map((query: string, i: number) => (
                                                <li key={i}>{query}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {result.aiAdditionalResearchRequest.searchSources && (
                                    <div>
                                        <strong>Sources AI Wants to Search:</strong> {result.aiAdditionalResearchRequest.searchSources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-blue-400 mb-2">📊 Agent Status:</h3>
                        <div className="text-sm">
                            <div>Status: <span className="font-bold">{result.metadata?.status}</span></div>
                            <div>AI Decisions Made: {result.metadata?.aiDecisionsMade?.length || 0}</div>
                            <div>Confidence Score: {result.metadata?.confidenceScore}%</div>
                        </div>
                    </div>

                    {/* Raw Data */}
                    <details className="bg-gray-800 p-2 rounded">
                        <summary>🔍 Full Agent Response (Click to expand)</summary>
                        <pre className="text-sm mt-2 overflow-x-auto max-h-96 overflow-y-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    )
}