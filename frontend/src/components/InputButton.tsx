import { Button } from "@mui/material";
import React from "react";
type InputButtonProps = {
  handleFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  title?: string;
};
export const InputButton = ({handleFileInput,title = 'Choose File', loading}: InputButtonProps) => {
  return (
    <>
      <input
        accept="image/*"
        aria-label="Upload image file"
        id="file-upload"
        onChange={handleFileInput}
        style={{ display: "none" }}
        type="file"
      />
      <label htmlFor="file-upload" style={{ width: '100%' }}>
        <Button
          aria-busy={loading}
          component="span"
          fullWidth
          loading={loading}
          size="small"
          variant="contained"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "primary.main",
            p: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
          }}
        >
          {title}
        </Button>
      </label>
    </>
  );
};
