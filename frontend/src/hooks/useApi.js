import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Custom hook for handling API requests with loading and error states.
 * Updated to prevent sending 'null' bodies on DELETE requests.
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

        // 1. Build the base configuration
        const config = {
          url: `${baseUrl}${endpoint}`,
          method,
          headers: {
            // Only set application/json if we aren't sending a file (FormData)
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };

        // 2. CRITICAL FIX: Only attach the data property if data is actually provided.
        // This prevents Axios from turning 'null' into the string "null" in the HTTP body.
        if (data !== null) {
          config.data = data;
        }

        const response = await axios(config);

        return response.data;
      } catch (err) {
        // Extract the most relevant error message from the backend response
        const errorMessage = 
          err.response?.data?.error || 
          err.response?.data?.message || 
          err.message || 
          "Something went wrong";
        
        setError(errorMessage);

        // Handle Token Expiry (401 Unauthorized)
        if (err.response?.status === 401) {
          console.warn("Session expired. Logging out...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        
        // Re-throw the error so the calling component (like useDocuments) can handle it
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  return { request, loading, error };
};