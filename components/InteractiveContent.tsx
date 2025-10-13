'use client'

import { useState } from 'react'
import StockChart from '@/components/StockChart'
import StockInput from '@/components/ui/StockInput'
import ErrorMessage from '@/components/ui/ErrorMessage'
import AILoadingState from '@/components/analysis/AILoadingState'
import AIInsightsReport from '@/components/analysis/AIInsightsReport'

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

  const handleAnalyze = async () => {
    if (!stockSymbol.trim()) return
    
    setIsLoading(true)
    setError(null)
    setAiAnalysis(null)
    
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
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
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
      setAiAnalysis(analysisResult)
      
    } catch (error) {
      console.error('Error getting AI analysis:', error)
      setError('Sorry, AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
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
        onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
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
    </>
  )
}