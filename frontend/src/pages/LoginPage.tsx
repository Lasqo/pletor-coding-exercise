import { Auth } from "../components/Auth/Auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import { User } from "../components/Auth/Auth.types";


export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthSuccess, handleAuthError } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const onLogin = (user: User) => {
    handleAuthSuccess(user);
    navigate(from, { replace: true });
  };

  return (
    <Box sx={{ maxWidth: "600px", justifySelf: "center", p: 3 }}>
      <Auth onLogin={onLogin} onError={handleAuthError} />
    </Box>
  );
};

