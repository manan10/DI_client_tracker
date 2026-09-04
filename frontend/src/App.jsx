import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "./shared/hooks/useAuth";

// --- Layouts ---
import ExpenseTrackerLayout from "./apps/expense-tracker/layouts/ExpenseTrackerLayout";
import TallyTest from "./apps/client-tracker/pages/TallyTest";

// --- Lazy Loaded Pages ---
// Client Tracker App Components
const Home = lazy(() => import("./apps/client-tracker/pages/Home"));
const ClientDirectory = lazy(() => import("./apps/client-tracker/pages/ClientDirectory"));
const Settings = lazy(() => import("./apps/client-tracker/pages/Settings"));
const Accounts = lazy(() => import("./apps/client-tracker/pages/Accounts"));
const ClientDetail = lazy(() => import("./apps/client-tracker/pages/ClientDetail"));
const Operations = lazy(() => import("./apps/client-tracker/pages/Operations"));
const MaintenanceView = lazy(() => import("./apps/client-tracker/pages/MaintenanceView"));
const TallyDebtorTest = lazy(() => import("./apps/client-tracker/pages/TallyDebtorTest"));

// Home Expense Tracker App Components
const ExpenseDashboard = lazy(() => import("./apps/expense-tracker/pages/ExpenseDashboard"));
const ExpenseDashboardNew = lazy(() => import("./apps/expense-tracker/pages/ExpenseDashboardNew"));
const MaintenanceViewExpenses = lazy(() => import("./apps/expense-tracker/pages/MaintenanceViewExpenses"));
const ExpenseSettings = lazy(() => import("./apps/expense-tracker/pages/ExpenseSettings"));
const ExpenseAnalytics = lazy(() => import("./apps/expense-tracker/pages/ExpenseAnalytics"));
const ExpenseHistory = lazy(() => import("./apps/expense-tracker/pages/ExpenseHistory"));
const ExpenseHistoryNew = lazy(() => import("./apps/expense-tracker/pages/ExpenseHistoryNew"));

// Shared Components
const Auth = lazy(() => import("./shared/pages/Auth"));
const AppPicker = lazy(() => import("./shared/pages/AppPicker"));

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
                {/* <Route path="/expenses/history" element={<ExpenseHistory />} /> */}
                <Route path="/expenses/history" element={<ExpenseHistoryNew />} />
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

              <Route
                path="/tally-debtor-test"
                element={
                  <ProtectedRoute>
                    <TallyDebtorTest />
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