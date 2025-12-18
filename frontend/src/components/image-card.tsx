import { Fragment, useState } from 'react';
import { ConfirmModal } from './confirm-modal';

export type Image = {
  id: string;
  title: string;
  created_by: string;
  users_access: string;
  url: string;
  created_at: string;
};

type ImageCardProps = {
  data: Image;
  onDelete: (id: string) => void;
};

export function ImageCard({ data, onDelete }: ImageCardProps) {
  const { id, title, created_by, users_access, url, created_at } = data;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDelete(id);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const onLoadHandler = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Check if the image loaded is actually valid (not a 0x0 placeholder or broken)
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      setHasImageError(true);
    } else {
      setIsImageLoaded(true);
    }
  };

  const onErrorHandler = () => {
    setHasImageError(true);
  };

  return (
    <Fragment key={id}>
      <div
        style={{
          boxShadow: '0 4px 24px #0002',
          borderRadius: 16,
          padding: 0,
          background: '#fff',
          overflow: 'hidden',
          border: '1px solid #eee',
          maxWidth: 500,
          transition: 'box-shadow 0.2s',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {hasImageError ? (
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              background: '#eee',
              color: '#666',
              textAlign: 'center',
              padding: 24,
            }}
          >
            Unable to find the image, please check the link
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Shimmer loading skeleton */}
            {!isImageLoaded && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            )}
            <img
              src={url}
              alt={title}
              loading="lazy"
              onLoad={onLoadHandler}
              onError={onErrorHandler}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover',
                opacity: isImageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
              }}
            />
          </div>
        )}
        <div
          style={{
            padding: 24,
            paddingTop: 18,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            overflow: 'hidden',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#222' }}>{title}</h2>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            <span style={{ color: '#888 ', fontWeight: 400 }}>By: </span>
            <span style={{ color: '#222', fontWeight: 500 }}>{created_by}</span>
          </p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            <span style={{ color: '#888', fontWeight: 400 }}>Users access: </span>
            <span style={{ color: '#222', fontWeight: 500 }}>{users_access}</span>
          </p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            <span style={{ color: '#888', fontWeight: 400 }}>Created: </span>
            <span style={{ color: '#222', fontWeight: 500 }}>{new Date(created_at).toLocaleDateString()}</span>
          </p>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <span style={{ color: '#888', fontWeight: 400, flexShrink: 0 }}>URL: </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="fade-text"
              style={{
                color: '#222',
                fontWeight: 500,
              }}
            >
              {url}
            </a>
          </p>
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginTop: 18,
              width: '100%',
            }}
          >
            <button
              onClick={handleDeleteClick}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '8px 24px',
                cursor: 'pointer',
                height: 40,
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 2px 8px #e74c3c22',
                transition: 'background 0.2s',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Image"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Fragment>
  );
}
