export type TrialInfo = {
    startDate?: string;
    endDate?: string;
};

export type UserProfileLike = {
    subscription?: { plan?: string };
    trial?: TrialInfo;
    role?: string;
};

const isAdminUser = (userProfile?: UserProfileLike | null): boolean => {
    return String(userProfile?.role || '').trim().toLowerCase() === 'admin';
};

const isValidDate = (value?: string) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
};

export const isTrialActive = (trial?: TrialInfo): boolean => {
    if (!trial?.startDate || !trial?.endDate) return false;
    if (!isValidDate(trial.startDate) || !isValidDate(trial.endDate)) return false;
    return Date.now() <= new Date(trial.endDate).getTime();
};

export const normalizePlanLabel = (plan: any): 'Free' | 'Pro' => {
    if (!plan) return 'Free';
    const p = String(plan).trim().toLowerCase();
    if (p === 'pro') return 'Pro';
    if (p === 'premium') return 'Pro';
    return 'Free';
};

export const normalizePlanLower = (plan: any): 'free' | 'pro' => {
    if (!plan) return 'free';
    const p = String(plan).trim().toLowerCase();
    if (p === 'pro') return 'pro';
    if (p === 'premium') return 'pro';
    return 'free';
};

export const getBasePlanLower = (userProfile?: UserProfileLike | null): 'free' | 'pro' => {
    return normalizePlanLower(userProfile?.subscription?.plan);
};

export const hasPaidPlan = (userProfile?: UserProfileLike | null): boolean => {
    return getBasePlanLower(userProfile) !== 'free';
};

export const isSubscriptionRestricted = (userProfile?: UserProfileLike | null): boolean => {
    if (!userProfile) return false;
    return !hasPaidPlan(userProfile) && !isTrialActive(userProfile.trial);
};

export const shouldRestrictAppAccess = (userProfile?: UserProfileLike | null): boolean => {
    if (!userProfile) return false;
    if (isAdminUser(userProfile)) return false;
    return isSubscriptionRestricted(userProfile);
};

export const getEffectivePlanLabel = (
    userProfile?: UserProfileLike | null,
    options?: { excludeTrial?: boolean }
): 'Free' | 'Pro' => {
    const basePlan = userProfile?.subscription?.plan || 'free';
    if (!options?.excludeTrial && isTrialActive(userProfile?.trial)) return 'Pro';
    return normalizePlanLabel(basePlan);
};

export const getEffectivePlanLower = (
    userProfile?: UserProfileLike | null,
    options?: { excludeTrial?: boolean }
): 'free' | 'pro' => {
    const basePlan = userProfile?.subscription?.plan || 'free';
    if (!options?.excludeTrial && isTrialActive(userProfile?.trial)) return 'pro';
    return normalizePlanLower(basePlan);
};
