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
        const response = await axios({
          url: `${baseUrl}${endpoint}`,
          method,
          data,
        });
        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Something went wrong",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl],
  );

  return { request, loading, error };
};
