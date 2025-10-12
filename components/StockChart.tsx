'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts'

interface StockDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockChartProps {
  data: StockDataPoint[]
  symbol: string
  onBarClick?: (dataPoint: StockDataPoint) => void
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="chart-tooltip">
        <h4 className="tooltip-title">{label}</h4>
        <div className="tooltip-content">
          <div className="price-row">
            <span className="label">Open:</span>
            <span className="value open">${data.open.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span className="label">High:</span>
            <span className="value high">${data.high.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span className="label">Low:</span>
            <span className="value low">${data.low.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span className="label">Close:</span>
            <span className="value close">${data.close.toFixed(2)}</span>
          </div>
          <div className="price-row volume">
            <span className="label">Volume:</span>
            <span className="value">{data.volume.toLocaleString()}</span>
          </div>
        </div>
        <div className="tooltip-hint">Click for AI analysis</div>
      </div>
    )
  }
  return null
}

export default function StockChart({ data, symbol, onBarClick }: StockChartProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  
  // Transform data for the chart
  const chartData = data.map(point => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    // Calculate price range for OHLC visualization
    priceRange: point.high - point.low,
    changePercent: ((point.close - point.open) / point.open * 100)
  }))
  
  // 🔹 MODIFIED: Custom OHLC Bar component with individual click handlers
  const OHLCBar = (props: any) => {
    const { payload, x, y, width, height } = props
    
    if (!payload) return null
    
    const { open, high, low, close, date } = payload
    const isPositive = close >= open
    const isSelected = selectedDate === date
    
    // 🔹 MODIFIED: Color logic with selection highlight
    let color = isPositive ? '#10b981' : '#ef4444' // Green for up, red for down
    if (isSelected) {
      color = '#60a5fa' // Blue when selected
    }
    
    // Calculate positions
    const openY = y + height - ((open - payload.low) / (payload.high - payload.low)) * height
    const closeY = y + height - ((close - payload.low) / (payload.high - payload.low)) * height
    const highY = y
    const lowY = y + height
    
    const barWidth = Math.max(width * 0.6, 2)
    const centerX = x + width / 2
    
    // 🔹 ADDED: Click handler for individual bars
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent event bubbling
      console.log('🔥 Bar clicked:', payload) // Debug log
      
      // Set selected state
      setSelectedDate(date)
      
      // Call parent's onBarClick with the data point
      if (onBarClick) {
        onBarClick({
          date: payload.date,
          open: payload.open,
          high: payload.high,
          low: payload.low,
          close: payload.close,
          volume: payload.volume
        })
      }
    }
    
    return (
      <g 
        className="ohlc-bar" 
        style={{ cursor: 'pointer' }}
        onClick={handleClick} // 🔹 ADDED: Individual click handler
      >
        {/* High-Low line */}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={lowY}
          stroke={color}
          strokeWidth={isSelected ? 2.5 : 1.5} // 🔹 ADDED: Thicker line when selected
        />
        
        {/* Open-Close body */}
        <rect
          x={centerX - barWidth / 2}
          y={Math.min(openY, closeY)}
          width={barWidth}
          height={Math.abs(closeY - openY) || 1}
          fill={color}
          stroke={color}
          strokeWidth={isSelected ? 1.5 : 1} // 🔹 ADDED: Thicker stroke when selected
          className="candlestick-body"
        />
        
        {/* 🔹 ADDED: Invisible larger click area for easier clicking */}
        <rect
          x={centerX - width / 2}
          y={y}
          width={width}
          height={height}
          fill="transparent"
          className="click-area"
        />
      </g>
    )
  }
  
  // Calculate price bounds for better scaling
  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close])
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceMargin = (maxPrice - minPrice) * 0.1
  
  return (
    <div className="stock-chart-container">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="chart-title">
          <h3 className="symbol">{symbol}</h3>
          <span className="chart-subtitle">30-Day Price Action</span>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color positive"></div>
            <span>Bullish</span>
          </div>
          <div className="legend-item">
            <div className="legend-color negative"></div>
            <span>Bearish</span>
          </div>
          {/* 🔹 ADDED: Selected state indicator in legend */}
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      
      {/* Main Chart */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            // 🔹 REMOVED: onClick from ComposedChart (now handled in individual bars)
          >
            <defs>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                <stop offset="100%" stopColor="rgba(147, 51, 234, 0.05)" />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="1 3" 
              stroke="rgba(59, 130, 246, 0.1)"
              fill="url(#gridGradient)"
            />
            
            <XAxis 
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              domain={[minPrice - priceMargin, maxPrice + priceMargin]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Selected date reference line */}
            {selectedDate && (
              <ReferenceLine 
                x={chartData.find(d => d.date === selectedDate)?.displayDate}
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
            
            {/* 🔹 MODIFIED: OHLC Bars with individual click handling */}
            <Bar
              dataKey="close"
              fill="transparent"
              shape={<OHLCBar />}
              className="interactive-bar"
            />
            
            {/* Close price trend line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="rgba(96, 165, 250, 0.6)"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart Footer */}
      <div className="chart-footer">
        <div className="analysis-hint">
          <span className="hint-icon">🤖</span>
          <span>Click on any bar to trigger AI analysis for that trading day</span>
        </div>
        {/* 🔹 ADDED: Show selected date info */}
        {selectedDate && (
          <div className="selected-info">
            <span>Selected: {new Date(selectedDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}