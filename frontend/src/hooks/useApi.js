import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Custom hook for handling API requests with loading and error states.
 */
export const useApi = (baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (endpoint, method = "GET", data = null) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const isFormData = data instanceof FormData;

        const config = {
          url: `${baseUrl}${endpoint}`,
          method,
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };

        if (data !== null) {
          config.data = data;
        }

        const response = await axios(config);
        return response.data;
      } catch (err) {
        // 1. Extract the specific message from the backend (e.g., "Insufficient funds")
        const errorMessage = 
          err.response?.data?.error || 
          err.response?.data?.message || 
          err.message || 
          "Something went wrong";
        
        setError(errorMessage);

        // Handle Token Expiry
        if (err.response?.status === 401) {
          console.warn("Session expired. Logging out...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        
        // 2. CRITICAL FIX: Throw the human-readable string instead of the raw Axios error.
        // This ensures Modal catch blocks get the actual message from the backend.
        throw new Error(errorMessage); 
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  return { request, loading, error };
};