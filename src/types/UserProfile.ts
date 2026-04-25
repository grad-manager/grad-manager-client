// src/types/UserProfile.ts (Recommended file location)

/**
 * 💡 Defines the structure for the user's subscription plan.
 */
export type Subscription = {
    plan: 'free' | 'pro';
    status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired';
    startDate: string; // Made required
    expirationDate: string; // Added for context in AuthContext.tsx
    paymentReference?: string; // Added for context in AuthContext.tsx
    paymentCurrency?: string;
    paymentAmount?: number;
    [key: string]: any; 
};

export type TrialInfo = {
    startDate: string;
    endDate: string;
};

/**
 * Defines the user roles.
 */
export type UserRole = 'user' | 'admin' | 'mentor';

/**
 * Defines notification settings.
 */
export interface NotificationSettings {
    email: boolean;
    push: boolean;
}

/**
 * 🔑 The core User interface representing the FULL data fetched from the backend (API/DB).
 * This includes all profile fields and the application metrics needed for logic checks.
 */
export interface UserProfile { // Aliased to UserProfile in AuthContext.tsx for consistency
    // DB & Auth Managed Fields (Core Profile)
    uid: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
    
    // 💡 CRITICAL: Application/Subscription Metrics (Used by ProgramList.tsx)
    applicationsCount: number; 
    subscription: Subscription;
    trial?: TrialInfo;
    trialActive?: boolean;
    
    // Optional Profile Fields
    photoURL?: string | null;
    gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | null;
    bio?: string | null;
    targetCountries?: string[] | null; 
    
    // Nested object
    notificationSettings: NotificationSettings;

    // Added for AuthContext.tsx consistency (will be Omitted from SaveData)
    mentorId: string | null;
    isConnectedToMentor: boolean;
}

/**
 * 💾 For initial creation or a full PUT/POST update.
 * Omit fields that are managed by the database (IDs, timestamps, metrics, role).
 */
export type UserProfileSaveData = Omit<
    UserProfile, 
    'uid' | 'createdAt' | 'updatedAt' | 'applicationsCount' | 'subscription' | 'role' | 'mentorId' | 'isConnectedToMentor'
>;

/**
 * 🩹 For PATCH operations (partial updates).
 * Takes the 'SaveData' type and makes all its fields optional.
 */
export type UserProfileUpdate = Partial<UserProfileSaveData>;

// To keep consistency if you prefer the name 'UserProfile' for the full object, 
// you can alias it:
// export type UserProfile = User;
