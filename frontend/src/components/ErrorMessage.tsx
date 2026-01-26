import './ErrorMessage.css'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="error-message-dismiss"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
