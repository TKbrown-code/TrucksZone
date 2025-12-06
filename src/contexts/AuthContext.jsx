import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { LoginUser } from "../hooks/useFunctions";

// Safe storage utility with error handling
const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing from localStorage (${key}):`, error);
    }
  },
  clear: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }
};

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = safeStorage.getItem("tz_user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    const stored = safeStorage.getItem("tz_profile");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing profile data from storage:', error);
      return null;
    }
  });

  const [session, setSession] = useState(() => {
    const stored = safeStorage.getItem("tz_session");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing session data from storage:', error);
      return null;
    }
  });

  const [initialising, setInitialising] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Simple in-memory rate limiter for login
  const loginRateState = useRef({ windowStart: 0, count: 0 });

  const applyLoginRateLimit = useCallback(() => {
    const WINDOW_MS = 60_000; // 1 minute
    const MAX_ATTEMPTS = 5;

    const now = Date.now();
    const { windowStart, count } = loginRateState.current;

    // New window
    if (!windowStart || now - windowStart > WINDOW_MS) {
      loginRateState.current = { windowStart: now, count: 1 };
      return;
    }

    // Existing window
    if (count >= MAX_ATTEMPTS) {
      throw new Error(
        "Too many login attempts. Please wait a minute before trying again."
      );
    }

    loginRateState.current = { windowStart, count: count + 1 };
  }, []);

  const resetLoginRateLimit = useCallback(() => {
    loginRateState.current = { windowStart: 0, count: 0 };
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsAdmin(false);
    setAuthError(null);
    resetLoginRateLimit();

    safeStorage.removeItem("tz_user");
    safeStorage.removeItem("tz_profile");
    safeStorage.removeItem("tz_session");
  }, [resetLoginRateLimit]);

  const fetchProfile = useCallback(async (authUserId) => {

    if (!authUserId) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUserId)
      .maybeSingle();  // <-- no 406 error

    if (error) {
      console.error("Failed to load profile", error.message);
      setIsAdmin(false);
      return null;
    }

    if (!data) {
      console.warn("No profile found for this user");
      setIsAdmin(false);
      return null;
    }

    setIsAdmin(data.is_admin);

    return data;
  }, []);

  // Sync React state + localStorage from a Supabase session
  const syncFromSession = useCallback(
    async (supabaseSession) => {
      if (!supabaseSession) {
        clearAuthState();
        return;
      }

      const authUser = supabaseSession.user;

      setSession(supabaseSession);
      setUser(authUser);

      // Only update storage if in browser environment
      if (typeof window !== 'undefined') {
        safeStorage.setItem("tz_session", JSON.stringify(supabaseSession));
        safeStorage.setItem("tz_user", JSON.stringify(authUser));
      }

      const profileData = await fetchProfile(authUser.id);

      if (profileData) {
        setProfile(profileData);
        safeStorage.setItem("tz_profile", JSON.stringify(profileData));
      } else {
        setProfile(null);
        safeStorage.removeItem("tz_profile");
      }
    },
    [clearAuthState, fetchProfile]
  );

  // Initial restore + subscribe to Supabase auth changes
  useEffect(() => {
    let subscription;

    const initialise = async () => {
      try {
        const {
          data: { session: activeSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.warn("Supabase getSession error", error.message);
        }

        if (activeSession) {
          await syncFromSession(activeSession);
        }
        // We no longer call syncFromSession(session) here.
        // Local state was already hydrated from localStorage in the useState initialisers.
      } catch (err) {
        console.error("Failed to restore auth state", err);
      } finally {
        setInitialising(false);
      }

      const { data } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          syncFromSession(newSession);
        }
      );

      subscription = data?.subscription;
    };

    initialise();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [syncFromSession]);

  // Login via edge function + Supabase session + profile/is_admin
  const login = useCallback(
    async ({ email, password }) => {
      setAuthError(null);
      applyLoginRateLimit();

      const response = await LoginUser({ email, password });

      let payload;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        const message = payload?.message || "Authentication failed";
        setAuthError(message);
        throw new Error(message);
      }

      if (!payload.session || !payload.user) {
        throw new Error("Invalid login response from server.");
      }

      const { session: loginSession } = payload;

      const { data, error } = await supabase.auth.setSession({
        access_token: loginSession.access_token,
        refresh_token: loginSession.refresh_token,
      });

      if (error) {
        console.error("Supabase setSession error", error.message);
      }

      await syncFromSession(data?.session || loginSession);

      // Successful login -> reset rate limiter window
      resetLoginRateLimit();

      return payload;
    },
    [applyLoginRateLimit, resetLoginRateLimit, syncFromSession]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error", err);
      // If signOut fails, still clear local state
      clearAuthState();
    }
    // The auth state change listener will handle clearing state when session becomes null
    // But we don't call clearAuthState here to avoid double-clearing
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isAdmin,
      initialising,
      authError,
      login,
      logout,
      supabase,
    }),
    [user, profile, session, isAdmin, initialising, authError, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}