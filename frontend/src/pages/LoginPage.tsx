import { Auth } from "../components/Auth/Auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";


export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthSuccess, handleAuthError } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const onLogin = (token: string, user: any) => {
    handleAuthSuccess(token, user);
    navigate(from, { replace: true });
  };

  return (
    <Box sx={{ maxWidth: "600px", justifySelf: "center", p: 3 }}>
      <Auth onLogin={onLogin} onError={handleAuthError} />
    </Box>
  );
};

