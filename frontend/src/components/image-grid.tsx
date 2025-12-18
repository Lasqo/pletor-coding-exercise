import { Image, ImageCard } from './image-card';
import { ImageCardSkeleton } from './image-card-skeleton';

type ImagesGridProps = {
  images: Image[];
  loading: boolean;
  onDelete: (id: string) => void;
};

export function ImagesGrid({ images, loading, onDelete }: ImagesGridProps) {
  // if (loading) {

  return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'stretch' }}>
      {[...Array(3)].map((_, i) => (
        <ImageCardSkeleton key={i} />
      ))}
    </div>
  );
  // }

  // if (images.length === 0) {
  //   return (
  //     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'stretch' }}>
  //       <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No images found.</p>
  //     </div>
  //   );
  // }

  // return (
  //   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'stretch' }}>
  //     {images.map((img) => (
  //       <ImageCard key={img.id} data={img} onDelete={onDelete} />
  //     ))}
  //   </div>
  // );
}
