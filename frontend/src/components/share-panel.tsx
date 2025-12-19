import { useState } from 'react';

type SharePanelProps = {
  isOpen: boolean;
  title: string;
  url: string;
  onClose: () => void;
};

export function SharePanel({ isOpen, title, url, onClose }: SharePanelProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleClose = () => {
    setIsCopied(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#222' }}>Share Image</h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
          Share "{title}" with others by copying the link below.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            type="text"
            value={url}
            readOnly
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 14,
              color: '#333',
              background: '#f9f9f9',
              minWidth: 0,
            }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopyLink}
            style={{
              background: isCopied ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {isCopied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
