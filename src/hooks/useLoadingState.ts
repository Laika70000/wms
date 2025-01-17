import { useState } from 'react';

export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const setLoadingError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError
  };
};