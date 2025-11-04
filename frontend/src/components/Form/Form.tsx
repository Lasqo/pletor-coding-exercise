import { useCallback, useState } from "react";
import { FormInputs } from "./Form.types";
import { Button, Box, Typography, } from "@mui/material";
import { API_URL } from "../../constants/app";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { FormInputText } from "./components/FormInputText";
import { DropDownZone } from "../DropDownZone/DropDownZone";
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

export const Form = ({ onUpload, remainingUploads }: { onUpload: () => void, remainingUploads?: number }) => {
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, reset } = useForm<FormInputs>({
    defaultValues: {
      title: "",
      user: "",
      url: "",
    },
  });

  const onSubmit = useCallback(async (data: FormInputs) => {
    setSubmitting(true);

    try {
      let imageUrl = data.url;

      if (selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        imageUrl = await base64Promise;
      }

      if (!imageUrl && !selectedFile) {
        throw new Error("Please provide either a file or URL");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          user: data.user,
          url: imageUrl,
        }),
      });

      if (!response.ok){
        const errorData = await response.json();
        if (errorData.detail) throw new Error(errorData.detail)
        else throw new Error("Upload failed");
      } 

      enqueueSnackbar("Image uploaded successfully!", { variant: "success",anchorOrigin: {
         vertical: 'bottom',
          horizontal: 'right'
          } });
      reset();
      setSelectedFile(null);
      setPreview(null);
      onUpload();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error",anchorOrigin: {
         vertical: 'bottom',
          horizontal: 'right'
          }});
    } finally {
      setSubmitting(false);
    }
  }, [selectedFile, enqueueSnackbar, reset, onUpload]);



  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        alignSelf: "center",
        background: "#f8f9fa",
        borderRadius: 2,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 3,
      }}
    >
    <DropDownZone
      preview={preview}
      onError={()=>{
         setPreview(null);
      }}
      onFinishImageLoad={({file, previewUrl}) => {
        setSelectedFile(file) 
         setPreview(previewUrl);
      }}
    />
      <FormInputText
        control={control}
        disabled={submitting }
        label="Image URL (optional)"
        name="url"
        rules={{
          pattern: {
            value: /^https?:\/\/.+/i,
            message: "Please enter a valid URL",
          },
          validate: (value) => {
            if (selectedFile && value) {
              return "Cannot provide both file and URL";
            }
            return true;
          },
        }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <FormInputText
          control={control}
          label="Title"
          name="title"
          required
          rules={{ required: "Title is required" }}
        />
        <FormInputText
          control={control}
          label="Username"
          name="user"
          required
          rules={{ required: "Username is required" }}
        />
      </Box>

      <Button
        disabled={submitting || remainingUploads === 0}
        fullWidth
        loading={submitting}
        sx={{ mt: 2, width: "300px", alignSelf: "center" }}
        type="submit"
        variant="contained"
      >
        Upload Image
      </Button>
      {remainingUploads && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
        <InfoOutlineIcon style={{ fontSize: 16, color: 'gray' }}/>
        <Typography sx={{  color: remainingUploads === 0 ? 'red' : 'gray', textAlign: 'center' }}>
        Remaining uploads for today: {remainingUploads}
      </Typography>
      </Box>
      )
      }
    </Box>
  );
};
