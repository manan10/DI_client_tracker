import { useState, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Custom hook for handling API requests with stable function references.
 */
export const useApi = (baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeRequests = useRef(0);

  const request = useCallback(
    async (endpoint, method = "GET", data = null) => {
      activeRequests.current += 1;
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
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong";

        setError(errorMessage);

        if (err.response?.status === 401) {
          console.warn("Session expired. Logging out...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        throw new Error(errorMessage);
      } finally {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        if (activeRequests.current === 0) {
          setLoading(false);
        }
      }
    },
    [baseUrl]
  );

  return { request, loading, error };
};