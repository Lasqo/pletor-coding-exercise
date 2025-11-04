import { useCallback, useEffect, useState } from "react";
import { Form } from "../components/Form/Form";
import { GalleryCards } from "../components/GalleryCards/GalleryCards";
import { useSnackbar } from "notistack";
import { API_BASE } from "../constants/app";
import { Image } from "../components/GalleryCards/GalleryCards.types";
import { useAuth } from "../providers/AuthProvider";

type QuotaInfo = {
  quota_limit: number;
  remaining: number;
  reset_time: Date;
  uploads_today: number;
  user: string;
};

type GlobalQuotaInfo = {
    global_limit: number
    remaining: number
    total_uploads_today: number 
}

export const GalleryView = () => {
  const [globalQuota, setGlobalQuota] = useState<GlobalQuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<Image[]>([]);
  const [userQuota, setUserQuota] = useState<QuotaInfo | null>(null);

  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const fetchImages = useCallback(() => {
    setLoading(true);
    const endpoint = user ? `${API_BASE}/images/me` : `${API_BASE}/images`;
    const headers: HeadersInit = {};

    fetch(endpoint, { credentials: 'include'})
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
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
      })
      .finally(() => setLoading(false));
  }, [user, enqueueSnackbar]);

  const fetchUserQuota = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/quota/me`, {
        credentials: 'include'
      });
      
      
      if (!response.ok) throw new Error('Failed to fetch user quota');
      const data = await response.json();
      setUserQuota(data);
    } catch (err) {
      console.error('Error fetching user quota:', err);
    }
  }, [user]);

  const fetchGlobalQuota = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/quota/global`,{
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch global quota');
      const data = await response.json();
      setGlobalQuota(data);
    } catch (err) {
      console.error('Error fetching global quota:', err);
    } 
  },[]);

  useEffect(() => {
    fetchImages();
    if (user) {
      fetchUserQuota();
      fetchGlobalQuota();
    }
  }, [fetchImages, fetchUserQuota, user]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/images/${id}`, { 
        method: "DELETE",
        credentials: 'include'
      });
      
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete image");
      }

      enqueueSnackbar("Image deleted successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });

      fetchImages();
      fetchUserQuota();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Failed to delete image",
        { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "right" } }
      );
    }
  };

  return (
    <>
        <Form 
          onUpload={() => {
            fetchImages();
            fetchUserQuota();
            fetchGlobalQuota();
          }}
          remainingUploads={{
            remainingUserUploadQuota: userQuota?.remaining,
            remainingGlobalUploadQuota: globalQuota?.remaining,
          }}
        />
      <GalleryCards
        handleDelete={handleDelete}
        images={images}
        loading={loading}
      />
    </>
  );
};

