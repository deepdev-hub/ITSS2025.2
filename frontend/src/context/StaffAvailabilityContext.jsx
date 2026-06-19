import { createContext, useContext, useMemo, useState } from 'react';

const StaffAvailabilityContext = createContext(null);

export function StaffAvailabilityProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');

  const value = useMemo(() => ({
    status,
    setStatus,
    loading,
    setLoading,
    initialized,
    setInitialized,
    error,
    setError,
  }), [status, loading, initialized, error]);

  return (
    <StaffAvailabilityContext.Provider value={value}>
      {children}
    </StaffAvailabilityContext.Provider>
  );
}

export function useStaffAvailability() {
  const context = useContext(StaffAvailabilityContext);
  if (!context) {
    throw new Error('useStaffAvailability must be used within StaffAvailabilityProvider');
  }
  return context;
}
