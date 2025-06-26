
"use client";

import React, { createContext, useContext } from 'react';
import type { User } from 'firebase/auth'; // Keep type for potential future use or remove if firebase is completely removed

// Define a minimal context type, effectively making user always null and loading always false
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Provide a default context value indicating no user and not loading
const defaultAuthContextValue: AuthContextType = {
  user: null,
  loading: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // No need for useAuth hook or loading state logic

  return (
    // Provide the default context value directly
    <AuthContext.Provider value={defaultAuthContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  // Return the context value, which will always be the default (no user, not loading)
  // No need to check for undefined context if always providing a default.
  return useContext(AuthContext);
}
