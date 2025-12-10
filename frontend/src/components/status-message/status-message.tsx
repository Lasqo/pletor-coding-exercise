interface StatusMessageProps {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

const STATUS_STYLES = {
  success: {
    background: '#d4edda',
    color: '#155724',
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
  },
} as const

/**
 * Displays a status message (success or error)
 */
export function StatusMessage({ type, message, visible }: StatusMessageProps) {
  if (!visible) return null

  const styles = STATUS_STYLES[type]

  return (
    <div
      style={{
        background: styles.background,
        color: styles.color,
        padding: 12,
        borderRadius: 6,
        marginBottom: 20,
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  )
}
