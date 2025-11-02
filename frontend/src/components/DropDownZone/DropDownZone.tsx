import { Box, Button, debounce, Skeleton, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import { InputButton } from "../InputButton";
type DropDownZoneProps = {
  onFinishImageLoad: ({
    file,
    previewUrl,
  }: {
    file: File | null;
    previewUrl: string | null;
  }) => void;
  onError: () => void;
  preview: string | null;
};
export const DropDownZone = ({
  onFinishImageLoad,
  onError,
  preview,
}: DropDownZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [imageLoading, setImageLoading] = useState(false);

  const finishImageLoad = useCallback(
    debounce(
      ({
        file,
        previewUrl,
      }: {
        file: File | null;
        previewUrl: string | null;
      }) => {
        onFinishImageLoad({ file, previewUrl });
        setFileError(null);
        setImageLoading(false);
      },
      800
    ),
    []
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setImageLoading(true);
      if (!file.type.startsWith("image/")) {
        setFileError("Please select an image file");
        onError();
        setImageLoading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size must be less than 5MB");
        onError();
        setImageLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const previewUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = previewUrl;

        img.onload = () => {
          finishImageLoad({ file, previewUrl });
        };
      };
      reader.readAsDataURL(file);
    },
    [finishImageLoad]
  );

  const handleRemoveFile = useCallback(() => {
    onFinishImageLoad({ file: null, previewUrl: null });
  }, []);

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        handleFileSelect(event.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        handleFileSelect(event.target.files[0]);
      }
    },
    [handleFileSelect]
  );
  return (
    <Box
      role="region"
      aria-label="Image upload drop zone"
      sx={{
        alignItems: "center",
        background: dragActive ? "rgba(0,119,204,0.05)" : "white",
        border: (theme) =>
          `2px dashed ${
            fileError
              ? theme.palette.error.main
              : dragActive
              ? theme.palette.primary.main
              : "#D2E6FE"
          }`,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: 450,
        justifyContent: "center",
        p: 2,
        transition: "all 0.2s",
        "&:hover": {
          backgroundColor: "#E9F3FF",
          cursor: "grab",
        },
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {preview || imageLoading ? (
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "350px",
            width: "100%",
          }}
        >
          {imageLoading || !preview ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              sx={{
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: 2,
                height: "100%",
                width: "350px",
              }}
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              style={{
                borderRadius: 8,
                height: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                width: "100%",
              }}
            />
          )}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              minWidth: "400px",
            }}
          >
            <InputButton
              handleFileInput={handleFileInput}
              loading={imageLoading}
              title="Choose another"
            />
            <Button
              fullWidth
              loading={imageLoading}
              onClick={handleRemoveFile}
              size="small"
              variant="contained"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "error.main",
                minWidth: "unset",
                p: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 1)",
                },
              }}
            >
              Remove
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Typography role="status" aria-live="polite" color="text.secondary">
              Drag and drop your image here
            </Typography>
            {fileError && (
              <Typography
                color="error"
                variant="caption"
                sx={{
                  alignItems: "center",
                  display: "flex",
                  gap: 0.5,
                  mt: 1,
                }}
              >
                {fileError}
              </Typography>
            )}
          </Box>
          <Box sx={{ width: "300px", alignSelf: "center" }}>
            <InputButton handleFileInput={handleFileInput} />
          </Box>
        </>
      )}
    </Box>
  );
};
