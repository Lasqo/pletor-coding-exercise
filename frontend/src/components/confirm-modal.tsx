type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#222' }}>{title}</h3>
        <p style={{ margin: '12px 0 24px', color: '#555', fontSize: 15 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 15,
              transition: 'background 0.2s',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: '0 2px 8px #e74c3c22',
              transition: 'background 0.2s',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
