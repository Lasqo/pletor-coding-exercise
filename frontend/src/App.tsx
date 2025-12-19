import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import './App.css';
import { Header } from './components/header';
import { ImageForm } from './components/image-form';
import { ImagesGrid } from './components/images-grid';
import { Image } from './components/image-card';

const API_URL = 'http://localhost:8000/images/';

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch images');
        return res.json();
      })
      .then(setImages)
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    console.log('fetching images');
    fetchImages();
  }, []);

  const handleAddImage = useCallback(
    async (data: { title: string; user: string; url: string }) => {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add image');
        fetchImages();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add image');
      }
    },
    [fetchImages]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(API_URL + id, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete image');
        fetchImages();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete image');
      }
    },
    [fetchImages]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        margin: '2rem auto',
        padding: '0 1rem',
        boxSizing: 'border-box',
      }}
    >
      <Header />
      <ImageForm onSubmit={handleAddImage} />
      <ImagesGrid images={images} loading={loading} onDelete={handleDelete} />
    </div>
  );
}

export default App;
