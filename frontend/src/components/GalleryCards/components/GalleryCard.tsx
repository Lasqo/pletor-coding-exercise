import { useState } from "react";
import { Box, Typography, Button, Fade, Zoom, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { Image } from "../GalleryCards.types";

type GalleryCardProps = {
  image: Image;
  handleDelete: (id: string) => void;
};

export const GalleryCard = ({ image, handleDelete }: GalleryCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleClosePreview = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the image
    if (e.target === e.currentTarget) {
      setShowPreview(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 4,
          boxShadow: "0 4px 24px #0002",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          margin: "0 auto",
          maxWidth: 500,
          overflow: "hidden",
          position: "relative",
          transition: "box-shadow 0.2s",
          "&:hover": {
            boxShadow: "0 6px 28px #0003",
          },
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            role="button"
            tabIndex={0}
            alt={`${image.title} by ${image.user}`}
            component="img"
            onClick={() => setShowPreview(true)}
            src={image.url}
            sx={{
              background: "#eee",
              cursor: "pointer",
              display: "block",
              height: 300,
              objectFit: "cover",
              transition: "transform 0.2s",
              width: "100%",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          />

          {isHovering && (
            <IconButton
              aria-label={`Delete ${image.title}`}
              onClick={() => handleDelete(image.id)}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                position: "absolute",
                right: 8,
                top: 8,
                "&:hover": {
                  backgroundColor: "rgba(231, 76, 60, 0.8)",
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Box
          sx={{
            background: "linear-gradient(transparent, rgba(0, 0, 0, 0.8))",
            bottom: 0,
            color: "white",
            left: 0,
            padding: 2,
            position: "absolute",
            right: 0,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {image.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            By: {image.user}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
            Created: {new Date(image.created_at).toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {showPreview && (
        <Fade in={showPreview} timeout={300}>
          <Box
            role="dialog"
            aria-modal="true"
            aria-labelledby={`preview-title-${image.id}`}
            onClick={handleClosePreview}
            sx={{
              opacity: 0,
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.9)",
              bottom: 0,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              left: 0,
              position: "fixed",
              right: 0,
              top: 0,
              transition: "opacity 0.3s ease-in-out",
              zIndex: 1000,
              "&.MuiFade-entered": {
                opacity: 1,
              },
            }}
          >
            <Fade in={showPreview} timeout={300}>
              <IconButton
                aria-label="Close preview"
                onClick={() => setShowPreview(false)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    transform: "scale(1)",
                  },
                  transform: "scale(0.9)",
                  transition: "transform 0.2s ease-out",
                }}
              >
                <CloseIcon />
              </IconButton>
            </Fade>

            <Box
              alt={`Full size preview of ${image.title}`}
              component="img"
              onClick={(e) => e.stopPropagation()}
              src={image.url}
              sx={{
                borderRadius: 2,
                cursor: "default",
                maxHeight: "90vh",
                maxWidth: "90vw",
                objectFit: "contain",
              }}
            />
          </Box>
        </Fade>
      )}
    </>
  );
};
