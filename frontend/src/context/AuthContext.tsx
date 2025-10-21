import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { fetchMe } from "../services/Auth";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  isAdmin: boolean;
  setIsLoggedIn?: React.Dispatch<React.SetStateAction<boolean>>;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  isAdmin: false,
  refreshAuth: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetchMe();
      setIsLoggedIn(res.status === 200);
    } catch (err) {
      console.error("Error checking auth:", err);
      setIsLoggedIn(false);
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
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
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
