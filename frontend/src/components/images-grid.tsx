import { Image, ImageCard } from './image-card';
import { ImageCardSkeleton } from './image-card-skeleton';
import './images-grid.css';

type ImagesGridProps = {
  images: Image[];
  loading: boolean;
  onDelete: (id: string) => void;
};

export function ImagesGrid({ images, loading, onDelete }: ImagesGridProps) {
  if (loading) {
    return (
      <div className="images-grid">
        {[...Array(3)].map((_, i) => (
          <ImageCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="images-grid">
        <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No images found.</p>
      </div>
    );
  }

  return (
    <div className="images-grid">
      {images.map((img) => (
        <ImageCard key={img.id} data={img} onDelete={onDelete} />
      ))}
    </div>
  );
}
