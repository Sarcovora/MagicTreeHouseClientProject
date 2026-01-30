import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, ensureUserDocument } from "../../firebase";
import apiService from "../../services/apiService";

const AuthContext = createContext({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
});

const LoadingState = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 shadow-sm">
      Checking your account…
    </div>
  </div>
);

/**
 * AuthProvider - Context provider for Firebase authentication
 * 
 * Manages user session state, profile loading from Firestore, and admin status.
 * Provides `useAuth()` hook for accessing user data and sign-out function.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - App components to wrap
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Always clear cache when auth state changes to prevent cross-user data leakage
      apiService.resetSeasonProjectsCache();
      
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileData = await ensureUserDocument(currentUser);
        setUser(currentUser);
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to load Firestore profile:", error);
        setUser(currentUser);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin: Boolean(profile?.isAdmin),
      loading,
      async signOut() {
        // Clear cached project data before signing out
        apiService.resetSeasonProjectsCache();
        await firebaseSignOut(auth);
        setProfile(null);
        setUser(null);
      },
      updateProfileState(updates) {
        setProfile((prev) => ({ ...prev, ...updates }));
      },
    }),
    [user, profile, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingState /> : children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useAuth - Hook to access authentication context
 * 
 * @returns {object} Auth context { user, profile, isAdmin, loading, signOut, updateProfileState }
 */
export const useAuth = () => useContext(AuthContext);
