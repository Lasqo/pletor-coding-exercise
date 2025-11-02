import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SnackbarProvider } from 'notistack';
import { closeSnackbar } from 'notistack'
import { Button } from '@mui/material';


createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <SnackbarProvider autoHideDuration={3000}  action={(snackbarId) => (
    <Button variant='text' sx={{ color: 'white' }} onClick={() => closeSnackbar(snackbarId)}>
      Dismiss
    </Button>
  )}>
    <App />
    </SnackbarProvider>
  </StrictMode>,
)
