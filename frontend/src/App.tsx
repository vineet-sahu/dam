import { Suspense } from "react";
import "./App.css";
import GlobalLoader from "./components/common/GlobalLoader";
import { AppRoutes } from "./routes";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";

function App() {
  return (
    <div>
      <GlobalLoader />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Suspense fallback={<GlobalLoader />}>
        <AuthProvider>
          <Navbar />
          <div id="main">
            <AppRoutes />
          </div>
        </AuthProvider>
      </Suspense>
    </div>
  );
}

export default App;
