import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { GalleryView } from "./pages/GalleryView";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { auth, handleLogout } = useAuth();

  return (
    <>
      <Box sx={{ 
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottom: '1px solid #eee',
        display: 'flex', 
        justifyContent: 'space-between', 
        p: 2,
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Image Gallery
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {auth ? (
            <>
              <Typography>Welcome, {auth.user.username}</Typography>
              <Button variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              component={Link} 
              to="/login"
            >
              Login
            </Button>
          )}
        </Box>
      </Box>

      <Routes>
        <Route path="/" element={<GalleryView />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;