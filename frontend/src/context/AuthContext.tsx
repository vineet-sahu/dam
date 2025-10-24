import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { fetchMe } from "../services/Auth";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  isAdmin: boolean;
  user: User | null;
  setIsLoggedIn?: React.Dispatch<React.SetStateAction<boolean>>;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  isAdmin: false,
  user: null,
  refreshAuth: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetchMe();
      if (res.status === 200) {
        setIsLoggedIn(true);
        setUser(res.data);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      console.error("Error checking auth:", err);
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
    Cookies.remove("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        refreshAuth: checkAuth,
        logout,
        isAdmin: false,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AppProvider");
  }
  return context;
};
