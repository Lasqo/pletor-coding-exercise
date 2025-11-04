import { createContext, useContext, useState, useEffect } from "react";
import { useSnackbar } from "notistack";

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

type User = {
  id: number;
  email: string;
  username: string;
  created_at: string;
};

type AuthState = {
  token: string;
  user: User;
} | null;

type AuthContextType = {
  auth: AuthState;
  handleAuthSuccess: (token: string, user: User) => void;
  handleAuthError: (message: string) => void;
  handleLogout: () => void;
  isCheckingAuth: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const loadAuthFromStorage = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const userStr = localStorage.getItem(AUTH_USER_KEY);
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setAuth({ token, user });
        }
      } catch (error) {
        console.error('Failed to load auth from localStorage:', error);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    loadAuthFromStorage();
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    setAuth({ token, user });
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  };

  const handleAuthError = (message: string) => {
    enqueueSnackbar(message, {
      variant: 'error',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
    });
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    
    enqueueSnackbar('Logged out successfully', {
      variant: 'info',
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      auth, 
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