import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "./hooks/useAuth";

// --- Layouts ---
import ExpenseTrackerLayout from "./layouts/ExpenseTrackerLayout";
import TallyTest from "./pages/ClientTracker/TallyTest";

// --- Lazy Loaded Pages ---
// Client Tracker App Components
const Home = lazy(() => import("./pages/ClientTracker/Home"));
const ClientDirectory = lazy(() => import("./pages/ClientTracker/ClientDirectory"));
const Settings = lazy(() => import("./pages/ClientTracker/Settings"));
const Accounts = lazy(() => import("./pages/ClientTracker/Accounts"));
const ClientDetail = lazy(() => import("./pages/ClientTracker/ClientDetail"));
const Operations = lazy(() => import("./pages/ClientTracker/Operations"));
const MaintenanceView = lazy(() => import("./pages/ClientTracker/MaintenanceView"));

// Home Expense Tracker App Components
const ExpenseDashboard = lazy(() => import("./pages/ExpenseTracker/ExpenseDashboard"));
const ExpenseDashboardNew = lazy(() => import("./pages/ExpenseTracker/ExpenseDashboardNew"));
const MaintenanceViewExpenses = lazy(() => import("./pages/ExpenseTracker/MaintenanceViewExpenses"));
const ExpenseSettings = lazy(() => import("./pages/ExpenseTracker/ExpenseSettings"));
const ExpenseAnalytics = lazy(() => import("./pages/ExpenseTracker/ExpenseAnalytics"));
const ExpenseHistory = lazy(() => import("./pages/ExpenseTracker/ExpenseHistory"));

// Shared Components
const Auth = lazy(() => import("./pages/Auth"));
const AppPicker = lazy(() => import("./pages/AppPicker"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="font-black uppercase text-xs tracking-[0.3em] text-slate-400">
      Loading Module...
    </p>
  </div>
);

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400 tracking-widest">
        Verifying Session...
      </div>
    );

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors expand={true} />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/tally-test" element={<TallyTest />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppPicker />
                  </ProtectedRoute>
                }
              />

              {/* --- EXPENSE TRACKER ROUTES WITH SHARED ACTION LAYOUT --- */}
              <Route
                element={
                  <ProtectedRoute>
                    <ExpenseTrackerLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/expenses" element={<ExpenseDashboardNew />} />
                <Route path="/expenses/analytics" element={<ExpenseAnalytics />} />
                <Route path="/expenses/history" element={<ExpenseHistory />} />
              </Route>

              {/* Expense Settings (Excluded from Global Floating Actions) */}
              <Route
                path="/expenses/settings"
                element={
                  <ProtectedRoute>
                    <ExpenseSettings />
                  </ProtectedRoute>
                }
              />

              {/* --- CLIENT TRACKER APP ROUTES --- */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/directory"
                element={
                  <ProtectedRoute>
                    <ClientDirectory />
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
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <MaintenanceView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Operations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/:id"
                element={
                  <ProtectedRoute>
                    <ClientDetail />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;