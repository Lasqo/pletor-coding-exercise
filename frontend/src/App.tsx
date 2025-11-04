import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { API_BASE, API_URL } from "./constants/app";
import { Form } from "./components/Form/Form";
import { Image } from "./components/GalleryCards/GalleryCards.types";
import { GalleryCards } from "./components/GalleryCards/GalleryCards";
import { useSnackbar } from "notistack";
import { Box } from "@mui/material";
type QuotaInfo = {
    quota_limit: number
    remaining: number
    reset_time: Date
    uploads_today: number  
    user: string
}
type GlobalQuotaInfo = {
    global_limit: number
    remaining: number
    total_uploads_today: number 
}

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [userQuota, setUserQuota] = useState<QuotaInfo | null>(null);
  const [globalQuota, setGlobalQuota] = useState<GlobalQuotaInfo | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchImages = useCallback(() => {
    setLoading(true);
    fetch(API_URL)
      .then((result): Promise<Image[]> => {
        if (!result.ok) {
          throw new Error("Failed to fetch images");
        }
        return result.json();
      })
      .then(setImages)
      .catch((error: Error) => {
        enqueueSnackbar(error.message, {
          variant: "error",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        });
      })
  }, [enqueueSnackbar]);
  
  const fetchUserQuota = async (username:string) => {
    if (!username) {
      setUserQuota(null);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/quota/${username}`);
      if (!response.ok) throw new Error('Failed to fetch user quota');
      const data = await response.json();
      setUserQuota(data);
    } catch (err) {
      console.error('Error fetching user quota:', err);
    }
  };

  const fetchGlobalQuota = async () => {
    try {
      const response = await fetch(`${API_BASE}/quota/global/info`);
      if (!response.ok) throw new Error('Failed to fetch global quota');
      const data = await response.json();
      setGlobalQuota(data);
    } catch (err) {
      console.error('Error fetching global quota:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchImages();
    fetchUserQuota("josh");
    fetchGlobalQuota();
  }, [fetchImages]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(API_URL + id, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete image");

      enqueueSnackbar("Image deleted successfully", {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      });

      fetchImages();
      fetchUserQuota("josh");
      fetchGlobalQuota();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Failed to delete image",
        {
          variant: "error",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        }
      );
    }
  };

  return (
    <>
    <Box>
      <h1
        style={{
          alignSelf: "center",
          color: "#222",
          fontSize: "3rem",
          fontWeight: 700,
          letterSpacing: "-2px",
          textAlign: "center",
        }}
      >
        Image Gallery
      </h1>
      </Box>
      <Form onUpload={()=>{
        fetchImages();
        fetchUserQuota("josh");
        fetchGlobalQuota();
      }} 
      remainingUploads={userQuota?.remaining} />
      <GalleryCards
        handleDelete={handleDelete}
        images={images}
        loading={loading}
      />
    </>
  );
}

export default App;
