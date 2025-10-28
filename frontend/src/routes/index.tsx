import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import { Dashboard } from "../pages/Dashboard";
import SignInPage from "../pages/SignIn";
import { Signup as SignupPage } from "../pages/Signup";
import ProtectedRoute from "./protectedRoutes";
import UploadPage from "../pages/Upload";
import GalleryPage from "../pages/Gallery";
import { useAuthContext } from "../context/AuthContext";
import { Logout } from "../components/common/Logout";
import AssetViewPage from "../pages/AssetViewPage";
import SharedAssetPage from "../pages/SharedAssetPage";
import MySharesPage from "../pages/MySharesPage";
import AdminDashboard from "../pages/AdminDashboard";

export const AppRoutes = () => {
  const { isLoggedIn } = useAuthContext();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asset/:id"
        element={
          <ProtectedRoute>
            <AssetViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/share/:token"
        element={
          <ProtectedRoute>
            <SharedAssetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-shares"
        element={
          <ProtectedRoute>
            <MySharesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/signIn"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignInPage />}
      />
      <Route
        path="/signUp"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignupPage />}
      />
      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
};
