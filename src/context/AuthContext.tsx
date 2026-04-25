/* AuthContext.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import {
  type User as AuthUser,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  getAdditionalUserInfo,
  setPersistence,
  browserLocalPersistence,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { auth } from "../firebase";
import { registerPushSubscription } from "../utils/pushNotifications";

// --- Type Definitions ---
export type UserRole = "user" | "mentor" | "admin";

export interface UserProfileInternal {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  mentorId: string | null;
  isConnectedToMentor: boolean;
  photoURL?: string | null;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say" | null | "";
  bio?: string | null;
  targetCountries?: string[] | null;
  notificationSettings: {
    email: boolean;
    push: boolean;
  };
  applicationsCount: number;
  subscription: {
    plan: "free" | "pro";
    status: "active" | "inactive" | "pending" | "cancelled" | "expired";
    startDate: string;
    expirationDate: string;
    paymentReference?: string;
    paymentCurrency?: string;
    paymentAmount?: number;
  };
  trial?: {
    startDate: string;
    endDate: string;
  };
}

type UserProfileUpdateInternal = Partial<
  Omit<
    UserProfileInternal,
    | "role"
    | "mentorId"
    | "isConnectedToMentor"
    | "email"
    | "subscription"
    | "applicationsCount"
  >
>;

type InitialUserData = Partial<
  Omit<
    UserProfileInternal,
    | "role"
    | "mentorId"
    | "isConnectedToMentor"
    | "subscription"
    | "applicationsCount"
  >
>;

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore | null = null;

const BACKEND_API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

if (!firebaseConfig.apiKey) {
  console.error(
    "Firebase config is missing environment variables. App will not be initialized.",
  );
} else {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}
// --- End Firebase Initialization ---

export interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfileInternal | null;
  loading: boolean;
  token: string | null;
  showProfileModal: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (
    email: string,
    password: string,
    initialData: InitialUserData,
  ) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  saveUserData: (uid: string, data: InitialUserData) => Promise<void>;
  updateUserProfile: (data: UserProfileUpdateInternal) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  setShowProfileModal: (show: boolean) => void;
  sendVerificationEmail: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creates placeholder Firestore profile for missing users
const createPlaceholderProfile = async (user: AuthUser, db: Firestore) => {
  const userDocRef = doc(db, "users", user.uid);
  if ((await getDoc(userDocRef)).exists()) return;

  const [firstName = "User", lastName = ""] = user.displayName?.split(" ") || [
    "",
    "",
  ];
  const trial = {
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const placeholderProfile: UserProfileInternal = {
    email: user.email || "unknown@example.com",
    firstName,
    lastName,
    role: "user",
    mentorId: null,
    isConnectedToMentor: false,
    photoURL: user.photoURL || null,
    gender: null,
    bio: null,
    targetCountries: null,
    notificationSettings: { email: true, push: false },
    applicationsCount: 0,
    subscription: {
      plan: "free",
      status: "active",
      startDate: new Date().toISOString(),
      expirationDate: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    trial,
  };

  try {
    await setDoc(userDocRef, placeholderProfile, { merge: true });
    console.log(
      `[Firestore] Created placeholder profile for user: ${user.uid}`,
    );
  } catch (error) {
    console.error(`[Firestore Error] Failed to create placeholder:`, error);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileInternal | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const googleProvider = new GoogleAuthProvider();

  const cleanCountryArray = (countries: any): string[] | null => {
    if (Array.isArray(countries)) {
      const cleaned = countries.filter(
        (c) => typeof c === "string" && c.trim() !== "",
      );
      return cleaned.length > 0 ? cleaned : null;
    }
    return null;
  };

  const saveUserData = async (uid: string, data: InitialUserData) => {
    try {
      if (db) {
        const cleanedData = {
          ...data,
          gender: data.gender === "" ? null : (data.gender ?? null),
          bio: data.bio === "" ? null : (data.bio ?? null),
          photoURL: data.photoURL === "" ? null : (data.photoURL ?? null),
          targetCountries: cleanCountryArray(data.targetCountries),
        };

        const trial = {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const userDataWithDefaults: UserProfileInternal = {
          ...(cleanedData as any),
          role: "user",
          mentorId: null,
          isConnectedToMentor: false,
          email: cleanedData.email || "",
          firstName: cleanedData.firstName || "",
          lastName: cleanedData.lastName || "",
          notificationSettings: cleanedData.notificationSettings || {
            email: true,
            push: false,
          },
          applicationsCount: 0,
          subscription: {
            plan: "free",
            status: "active",
            startDate: new Date().toISOString(),
            expirationDate: new Date(
              Date.now() + 90 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          trial,
        };

        await setDoc(doc(db, "users", uid), userDataWithDefaults);
      }
    } catch (error) {
      console.error("Error writing document:", error);
      throw error;
    }
  };

  // 🟢 SIGNUP
  const signup = async (
    email: string,
    password: string,
    initialData: InitialUserData,
  ) => {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    if (user) {
      await saveUserData(user.uid, { ...initialData, email: user.email! });
      await sendEmailVerification(user);

      // Welcome email
      try {
        await fetch(`${BACKEND_API_BASE_URL}/welcome/send-welcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            firstName: initialData.firstName,
          }),
        });
      } catch (e) {
        console.warn("Welcome email API error:", e);
      }

      // 🆕 Register Push Notifications
      const newToken = await user.getIdToken();
      localStorage.setItem("token", newToken);
      setToken(newToken);
      registerPushSubscription(newToken);

      try {
        await fetch(`${BACKEND_API_BASE_URL}/notifications/admin/new-user`, {
          method: "POST",
          headers: { Authorization: `Bearer ${newToken}` },
        });
      } catch (error) {
        console.warn("Failed to notify admins about new user signup:", error);
      }
    }

    return userCredential;
  };

  // 🟢 LOGIN
  const login = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const VERIFICATION_MANDATORY_DATE = new Date("2025-11-06T04:00:33.000Z");

    if (!user.emailVerified) {
      const creationDate = new Date(user.metadata.creationTime ?? 0);
      if (creationDate > VERIFICATION_MANDATORY_DATE) {
        await signOut(auth);
        throw new Error("Email not verified. Please check your inbox.");
      }
    }

    const newToken = await user.getIdToken();
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // 🆕 Register Push Notifications
    registerPushSubscription(newToken);

    return userCredential;
  };

  const loginWithGoogle = async () => {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    setToken(null);
    setUserProfile(null);
  };

  const sendPasswordResetEmail = (email: string) =>
    firebaseSendPasswordResetEmail(auth, email);

  const sendVerificationEmail = async () => {
    if (!currentUser) throw new Error("No user to resend verification email.");
    await sendEmailVerification(currentUser);
    await currentUser.getIdToken(true);
  };

  const updateUserProfile = async (data: UserProfileUpdateInternal) => {
    if (!currentUser) throw new Error("User must be logged in.");
    if (!db) throw new Error("Database not initialized.");

    const userDocRef = doc(db, "users", currentUser.uid);
    const cleanedData: any = {};

    for (const key in data) {
      const value = (data as any)[key];
      if (key === "gender" || key === "bio" || key === "photoURL") {
        cleanedData[key] = value === "" ? null : value;
      } else if (key === "targetCountries") {
        cleanedData[key] = cleanCountryArray(value);
      } else {
        cleanedData[key] = value;
      }
    }

    await updateDoc(userDocRef, cleanedData);

    const authUpdates: { displayName?: string; photoURL?: string | null } = {};
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const newFirstName = data.firstName ?? userProfile?.firstName ?? "";
      const newLastName = data.lastName ?? userProfile?.lastName ?? "";
      authUpdates.displayName = `${newFirstName} ${newLastName}`.trim();
    }
    if (data.photoURL !== undefined)
      authUpdates.photoURL = cleanedData.photoURL;
    if (Object.keys(authUpdates).length > 0)
      await firebaseUpdateProfile(currentUser, authUpdates);

    // Refresh local state
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists())
      setUserProfile(userDocSnap.data() as UserProfileInternal);
  };

  // To manually refresh the user's Firestore profile data
  const refreshUserData = useCallback(async () => {
    if (!currentUser || !db) return;

    try {
      const idToken = await currentUser.getIdToken(true);
      localStorage.setItem("token", idToken);
      setToken(idToken);

      const userDocRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const profile = snap.data() as UserProfileInternal;
        setUserProfile(profile);
      } else {
        console.warn(
          `Missing profile for UID: ${currentUser.uid} during refresh. Creating placeholder.`,
        );
        await createPlaceholderProfile(currentUser, db);
        const newSnap = await getDoc(userDocRef);
        if (newSnap.exists())
          setUserProfile(newSnap.data() as UserProfileInternal);
        else setUserProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [currentUser]);

  // Google Redirect Handler
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          const newToken = await user.getIdToken();
          localStorage.setItem("token", newToken);
          setToken(newToken);
          const info = getAdditionalUserInfo(result);
          if (info?.isNewUser && db) {
            await createPlaceholderProfile(user, db);
            setShowProfileModal(true);
            try {
              const newToken = await user.getIdToken();
              await fetch(
                `${BACKEND_API_BASE_URL}/notifications/admin/new-user`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${newToken}` },
                },
              );
            } catch (error) {
              console.warn(
                "Failed to notify admins about new Google signup:",
                error,
              );
            }
          }
          registerPushSubscription(newToken);
        }
      } catch (error) {
        console.error("Google redirect result error:", error);
      }
    };
    handleRedirectResult();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: AuthUser | null) => {
        setCurrentUser(user);
        if (user && db) {
          await refreshUserData();
        } else {
          localStorage.removeItem("token");
          setToken(null);
          setUserProfile(null);
        }
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [refreshUserData]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    token,
    showProfileModal,
    login,
    signup,
    logout,
    loginWithGoogle,
    saveUserData,
    updateUserProfile,
    sendPasswordResetEmail,
    setShowProfileModal,
    sendVerificationEmail,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 🟢 FIX TS2305 & TS2484: Alias UserProfileUpdateInternal back to UserProfileUpdate.
export type {
  AuthUser,
  UserProfileInternal as UserProfile,
  UserProfileUpdateInternal as UserProfileUpdate,
  InitialUserData,
};
