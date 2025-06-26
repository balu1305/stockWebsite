
"use client";

// No longer need Firebase imports if auth is removed
// import { type User } from 'firebase/auth';

// This hook is now simplified as authentication is removed.
// It consistently returns a state indicating no user and loading complete.
export function useAuth() {
  return { user: null, loading: false };
}
