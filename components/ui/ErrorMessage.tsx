'use client'

interface ErrorMessageProps {
  error: string
  onDismiss: () => void
}

export default function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-container">
      <div className="error-message">
        <span className="error-icon">⚠️</span>
        {error}
        <button 
          className="error-dismiss"
          onClick={onDismiss}
        >
          ✕
        </button>
      </div>
    </div>
  )
}