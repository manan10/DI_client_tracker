import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "./shared/hooks/useAuth";

// Modular App Routes
import { renderClientTrackerRoutes } from "./apps/client-tracker/routes";
import { renderExpenseTrackerRoutes } from "./apps/expense-tracker/routes";
import { renderTvRankerRoutes } from "./apps/tv-ranker/routes";
import { renderSousChefRoutes } from "./apps/sous-chef/routes";

// Shared Pages
const Auth = lazy(() => import("./shared/pages/Auth"));
const AppPicker = lazy(() => import("./shared/pages/AppPicker"));
const Settings = lazy(() => import("./shared/pages/Settings"));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B1120]">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="font-black uppercase text-xs tracking-[0.3em] text-slate-400">
      Loading Module...
    </p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400 tracking-widest">
        Verifying Session...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors expand={true} />
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public & Shared Routes */}
              <Route path="/login" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppPicker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app-picker"
                element={
                  <ProtectedRoute>
                    <AppPicker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Mini-App Route Suites */}
              {renderClientTrackerRoutes(ProtectedRoute)}
              {renderExpenseTrackerRoutes(ProtectedRoute)}
              {renderTvRankerRoutes(ProtectedRoute)}
              {renderSousChefRoutes(ProtectedRoute)}

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;