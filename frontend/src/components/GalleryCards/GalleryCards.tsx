
import { Box, Typography } from '@mui/material';
import { Image } from './GalleryCards.types'
import { GalleryCard } from './components/GalleryCard'
import { SkeletonCard } from './components/SkeletonCard';
 type GalleryCardsProps = {
  images: Array<Image>,
  loading: boolean,
  handleDelete: (id: string) => void,
}

export const GalleryCards = ({ images, loading, handleDelete }: GalleryCardsProps) => {
   const skeletonCards = Array.from({ length: 6 }, (_, index) => (
    <SkeletonCard key={`skeleton-${index}`} />
  ));
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16,
        alignItems: 'stretch',
        padding: 24
      }}>
        {skeletonCards}
      </div>
    )
  }
  if(images.length === 0){
    return (
      <Box sx={{textAlign: 'center', padding: 4}}>
        <img src='/no-images.svg' alt="No images" style={{maxWidth: '200px', opacity: 0.5}}/>
        <Typography variant="h6" sx={{marginTop: 2, color: '#666'}}>
          No images to display.
        </Typography>
      </Box>
    )
  }

  return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax( 1fr,340px))',
        gap: 16,
        alignItems: 'stretch',
        padding: 24
      }}>
    
        {images.map((image) => (
          <GalleryCard key={image.id} image={image} handleDelete={handleDelete} />
        ))}
      </div>
  )
}
