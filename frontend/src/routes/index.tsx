import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { Dashboard } from "../pages/Dashboard";
import SignInPage from "../pages/SignIn";
import { Signup as SignupPage } from "../pages/Signup";
import ProtectedRoute from "./protectedRoutes";
import UploadPage from "../pages/Upload";
import GalleryPage from "../pages/Gallery";
import { useAuthContext } from "../context/AuthContext";
import { Logout } from "../components/common/Logout";

export const AppRoutes = () => {
  const { isLoggedIn } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route
        path="/signIn"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignInPage />}
      />
      <Route
        path="/signUp"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignupPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
};
