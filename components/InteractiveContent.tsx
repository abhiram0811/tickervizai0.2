'use client'

import { useState } from 'react'
import StockChart from '@/components/StockChart'
import StockInput from '@/components/ui/StockInput'
import ErrorMessage from '@/components/ui/ErrorMessage'
import AILoadingState from '@/components/analysis/AILoadingState'
import AIInsightsReport from '@/components/analysis/AIInsightsReport'
import AgenticAnalysis from '@/components/agents/AgenticAnalysis'

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

export default function InteractiveContent() {
  const [stockSymbol, setStockSymbol] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [stockData, setStockData] = useState<StockResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [agenticAnalysis, setAgenticAnalysis] = useState<{
    symbol: string
    date: string
    ohlcData: StockDataPoint
  } | null>(null)

  const handleAnalyze = async () => {
    if (!stockSymbol.trim()) return
    
    setIsLoading(true)
    setError(null)
    setAiAnalysis(null)
    // 🔹 ADDED: Reset agentic analysis when searching new stock
    setAgenticAnalysis(null)
    
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
    console.log('🤖 Agentic Analysis 2.0 - Clicked on date:', dataPoint.date)
    
    // Show the inline agentic analysis
    setAgenticAnalysis({
      symbol: stockData?.symbol || '',
      date: dataPoint.date,
      ohlcData: dataPoint
    })
    
    // Smooth scroll to show both chart and analysis
    setTimeout(() => {
      const analysisElement = document.querySelector('.agentic-inline-container')
      if (analysisElement) {
        analysisElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }
    }, 100)
  }

  const handleInputChange = (value: string) => {
    setStockSymbol(value.toUpperCase())
  }

  const handleCloseAnalysis = () => {
    setAiAnalysis(null)
  }

  const handleDismissError = () => {
    setError(null)
  }

  return (
    <>
      {/* Input Section - Needs to be client for interactivity */}
      <StockInput
        stockSymbol={stockSymbol}
        isLoading={isLoading}
        isAnalyzing={isAnalyzing}
        onInputChange={handleInputChange}
        onAnalyze={handleAnalyze}
        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
      />

      {/* Error Display - Client component for dismiss functionality */}
      {error && (
        <ErrorMessage
          error={error}
          onDismiss={handleDismissError}
        />
      )}

      {/* Stock Chart - Client component for interactions */}
      {stockData && (
        <StockChart 
          data={stockData.data}
          symbol={stockData.symbol}
          onBarClick={handleBarClick}
        />
      )}

      {/* AI Analysis Loading State - Can be server component */}
      {isAnalyzing && <AILoadingState />}

      {/* AI Insights Report - Client component for close functionality */}
      {aiAnalysis && (
        <AIInsightsReport
          analysis={aiAnalysis}
          onClose={handleCloseAnalysis}
        />
      )}

      {/* Agentic Analysis 2.0 - Inline Component */}
      {agenticAnalysis && (
        <AgenticAnalysis
          symbol={agenticAnalysis.symbol}
          date={agenticAnalysis.date}
          ohlcData={agenticAnalysis.ohlcData}
        />
      )}
    </>
  )
}