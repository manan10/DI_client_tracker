import { useState, useCallback } from "react";
import axios from "axios";

export const useApi = (baseUrl = "http://localhost:5000/api") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (endpoint, method = "GET", data = null) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await axios({
          url: `${baseUrl}${endpoint}`,
          method,
          data,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Something went wrong";
        setError(errorMessage);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  return { request, loading, error };
};