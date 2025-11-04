import React, { createContext, useState, useEffect } from 'react';
import { fetchMe, logout as logoutUser } from '../services/auth-service';
import { useLogout } from '../hooks/useAuth';

interface User {
  id: string;
  name: string;
  email: string;
  admin: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  isAdmin: boolean;
  user: User | null;
  setIsLoggedIn?: React.Dispatch<React.SetStateAction<boolean>>;
  refreshAuth: () => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  isAdmin: false,
  user: null,
  refreshAuth: async () => {},
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const { mutate: logoutMutation } = useLogout();

  const checkAuth = async () => {
    try {
      const res = await fetchMe();
      if (res.status === 200) {
        setIsLoggedIn(true);
        setUser(res.data);
        console.log('User authenticated:', res.data);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        setIsLoggedIn(false);
        setUser(null);
      },
      onError: () => {
        setIsLoggedIn(false);
        setUser(null);
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        refreshAuth: checkAuth,
        logout,
        isAdmin: user?.admin as boolean,
        setIsLoggedIn,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AppProvider');
  }
  return context;
};
