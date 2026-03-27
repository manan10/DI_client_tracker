import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from "./hooks/useAuth";

import Home from "./pages/Home";
import ClientDirectory from "./pages/ClientDirectory";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents"; 
import Accounts from "./pages/Accounts";
import ClientDetail from "./pages/ClientDetail";
import MaintenanceView from "./pages/MaintenanceView";

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Loading Session...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors expand={true} />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Auth />} />

            <Route 
              path="/" 
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
                  {/* <Documents /> */}
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
              path="/client/:id"
              element={
                <ProtectedRoute>
                  <ClientDetail />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;