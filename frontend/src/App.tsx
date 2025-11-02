import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { API_URL } from "./constants/app";
import { Form } from "./components/Form/Form";
import { Image } from "./components/GalleryCards/GalleryCards.types";
import { GalleryCards } from "./components/GalleryCards/GalleryCards";
import { useSnackbar } from "notistack";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
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
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchImages();
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
      <Form fetchImages={fetchImages} />
      <GalleryCards
        handleDelete={handleDelete}
        images={images}
        loading={loading}
      />
    </>
  );
}

export default App;
