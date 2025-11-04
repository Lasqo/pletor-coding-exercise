import { createContext, useContext, useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { API_BASE } from "../constants/app";
import { User } from "../components/Auth/Auth.types";

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';




type AuthContextType = {
  user: User | null;
  handleAuthSuccess: (user: User) => void;
  handleAuthError: (message: string) => void;
  handleLogout: () => void;
  isCheckingAuth: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

   useEffect(() => {
    // Check if user is authenticated by calling /auth/me
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include', // Send cookies
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

   const handleAuthSuccess = (user: User) => {
    setUser(user);
  };

  const handleAuthError = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'error',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
    });
  };

 const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    setUser(null);
    
    enqueueSnackbar('Logged out successfully', {
      variant: 'info',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      handleAuthSuccess, 
      handleAuthError, 
      handleLogout,
      isCheckingAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};