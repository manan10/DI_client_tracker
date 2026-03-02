import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ClientDirectory from "./pages/ClientDirectory";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./hooks/useAuth";

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Loading Session...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
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

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;