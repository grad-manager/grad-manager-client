/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import React, { lazy, Suspense, useCallback, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { Analytics } from "@vercel/analytics/react";

// Contexts & Hooks
// ✅ FIX: Import AuthUser type for robustness
import { useAuth } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext"; 
import { useApplications } from "./hooks/useApplications"; 
import { useCVRequest } from "./hooks/useCVRequest";
import { useUserGroups } from "./hooks/useUserGroups";
import { useMentorRequests } from "./hooks/useMentorRequests";
// ✅ NEW: Import SOP Stats hook and interface
import { useSOPStats, type UserSOPStats } from "./hooks/useSOPStats"; 

// Components
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import ProtectedRoute from "./components/ProtectedRoute"; 
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import MentorProtectedRoute from "./components/MentorProtectedRoute";
import type { Application } from "./types/Application";
import type { DropResult } from "@hello-pangea/dnd"; 
import type { CVRequest } from "./types/documents";
import { warmPricingContext } from "./utils/pricingContext";
import { shouldRestrictAppAccess } from "./utils/trial";


// Lazy imports
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const MentorshipPage = lazy(() => import("./pages/MentorshipPage"));
const MentorshipConnectionsPage = lazy(() => import("./pages/MentorshipConnectionsPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const AdminBroadcastEmail = lazy(() => import("./pages/AdminBroadcastEmail"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const SupportPage = lazy(() => import("./components/Support"));
const FAQsPage = lazy(() => import("./components/FAQs"));
const ProjectRoom = lazy(() => import("./components/ProjectRoom"));
const Signup = lazy(() => import("./components/Signup"));
const Login = lazy(() => import("./components/Login")); 
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const ProgramList = lazy(() => import("./components/ProgramList"));
const ProgramSearch = lazy(() => import("./components/ProgramSearch"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminSubscriptionPaymentDashboard = lazy(() => import("./pages/AdminSubscriptionPaymentDashboard"));
const ConnectionsPage = lazy(() => import("./pages/ConnectionsPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const GroupChatPage = lazy(() => import("./pages/GroupChatPage"));
const GroupCallComponent = lazy(() => import("./components/GroupCallComponent"));
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage'));
const ApplicationTrackerPage = lazy(() => import('./pages/ApplicationTrackerPage'));
const AIPredictorPage = lazy(() => import('./pages/AIPredictorPage'));
const DocumentReviewServicePage = lazy(() => import('./pages/DocumentReviewServicePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const MyProfilePage = lazy(() => import('./pages/Profile')); 
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
// 🟢 NEW: Lazy import the Awaiting Verification Page
const AwaitingVerification = lazy(() => import('./pages/AwaitingVerification'));
const CommunityFeedPage = lazy(() => import("./pages/CommunityFeed"));
// 🟢 NEW: Lazy import the Subscription Page
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
// ⭐️ ADDED: Lazy import the Billing Page
const BillingPage = lazy(() => import('./pages/BillingPage'));


interface AppContentProps {
    applications: Application[];
    onDragEnd: (result: DropResult) => Promise<void>;
    onRefreshApplications: () => Promise<void>; 
    userSOPStats: UserSOPStats | undefined; 
}

const SUBSCRIPTION_LOCK_ALLOWED_PATHS = new Set([
    "/",
    "/about",
    "/features",
    "/contact",
    "/login",
    "/signup",
    "/forgot-password",
    "/privacy-policy",
    "/support",
    "/faqs",
    "/awaiting-verification",
    "/subscribe",
    "/settings/billing",
]);

// NEW COMPONENT: AppContent to encapsulate logic that needs router context (useNavigate)
const AppContent: React.FC<AppContentProps> = ({ 
    applications, 
    onDragEnd, 
    onRefreshApplications,
    userSOPStats,
}) => {
    const { currentUser, userProfile } = useAuth();
    // 💡 Hook must be called here to use router functionality
    const navigate = useNavigate(); 
    const location = useLocation();
    const isSubscriptionLocked = !!currentUser && shouldRestrictAppAccess(userProfile);
    const isAllowedWhileLocked = SUBSCRIPTION_LOCK_ALLOWED_PATHS.has(location.pathname);

    if (isSubscriptionLocked && !isAllowedWhileLocked) {
        const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
        return (
            <Navigate
                to={`/subscribe?reason=trial-expired&next=${encodeURIComponent(redirectTarget)}`}
                replace
                state={{ from: redirectTarget }}
            />
        );
    }

    // 🟢 FIX: Define the navigation handler here using useCallback and navigate
    const handleNavigateToSubscription = useCallback(() => {
        navigate('/subscribe');
    }, [navigate]);

    return (
        <Layout>
            <ScrollToTop />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/programs" element={<ProgramList />} />
                    <Route path="/search" element={<ProgramSearch />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/faqs" element={<FAQsPage />} />
                    {/* ✅ FIX 3: Pass the currentUser prop to SubscriptionPage */}
                    <Route path="/subscribe" element={<SubscriptionPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/notifications" element={<NotificationsPage />} />
                    </Route>
                    {/* 🟢 NEW ROUTE: Awaiting Verification Page */}
                    <Route path="/awaiting-verification" element={<AwaitingVerification />} />


                    {/* Authenticated Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/mentorship" element={<MentorshipPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/profile" element={<MyProfilePage />} />
                        <Route path="/profile/:userId" element={<ProfilePage />} />
                        {/* ⭐️ ADDED: Billing route for settings/billing */}
                        <Route path="/settings/billing" element={<BillingPage />} /> 
                        <Route path="/connections" element={<ConnectionsPage />} />
                        <Route path="/chat/:recipientId" element={<ChatPage />} />
                        <Route path="/interview-prep" element={<InterviewPrepPage />} />
                        <Route path="/groups" element={<GroupsPage />} />
                        <Route path="/group-chat/:groupId" element={<GroupChatPage />} />
                        <Route path="/group-call/:groupId" element={<GroupCallComponent />} />
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/project-room/:projectId" element={<ProjectRoom />} />
                        <Route path="/feeds" element={<CommunityFeedPage />} />

                        {/* Application Tracker Page */}
                        <Route 
                            path="/tracker" 
                            element={
                                <ApplicationTrackerPage 
                                    applications={applications}
                                    onApplicationStatusChange={onDragEnd as (result: DropResult) => void}
                                    onRefreshApplications={onRefreshApplications} 
                                />
                            } 
                        />

                        {/* AI Predictor Page */}
                        <Route 
                            path="/ai-predictor" 
                            element={<AIPredictorPage applications={applications} />} 
                        />

                        {/* Document Review Services Page */}
                        <Route 
                            path="/services/documents" 
                            element={
                                <DocumentReviewServicePage 
                                    // 🟢 Pass the locally defined handler
                                    onNavigateToSubscription={handleNavigateToSubscription}
                                    // 🟢 Pass the stats 
                                    userSOPStats={userSOPStats}
                                />
                            } 
                        />
                    </Route>

                    
                    {/* Admin/Mentor Routes (Omitted) */}
                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/mentorship-connections" element={<MentorshipConnectionsPage />} />
                        <Route path="/admin/broadcast-email" element={<AdminBroadcastEmail />} />
                        <Route path="/admin/subscriptions-payments" element={<AdminSubscriptionPaymentDashboard />} />
                    </Route>
                    <Route element={<MentorProtectedRoute />}>
                        <Route path="/mentor/connections" element={<MentorshipConnectionsPage />} />
                    </Route>
                </Routes>

                <ProfileSetupModal />
            </Suspense>
            <Analytics />
        </Layout>
    )
}

const App: React.FC = () => {
    const { currentUser, token, userProfile } = useAuth();
    const isSubscriptionLocked = shouldRestrictAppAccess(userProfile);
    const appCurrentUser = isSubscriptionLocked ? null : currentUser;
    const appToken = isSubscriptionLocked ? null : token;

    useEffect(() => {
        warmPricingContext();
    }, []);
    
    // --- Application Data ---
    const applicationHooks = useApplications(appCurrentUser, appToken);
    const { 
        applications, 
        onDragEnd, 
        handleRequestSOPWriting, 
        fetchApplications, 
    } = applicationHooks;
    const deleteApplication = applicationHooks.deleteApplication as (id: string) => void;
    
    // 🟢 SOP Stats Data
    const sopStatsResult = useSOPStats(appCurrentUser, appToken);
    const userSOPStats: UserSOPStats | undefined = sopStatsResult.userSOPStats; 


    // --- Other Hooks Data (Omitted) ---
    const cvHookResult = useCVRequest(appCurrentUser, appToken);
    const { cvRequest, handleCVUpload, handleNewCVRequest } = cvHookResult;
    const typedCVRequest = cvRequest as CVRequest | null;
    const { userGroups } = useUserGroups(appCurrentUser, appToken);
    const { handleSendMentorRequest } = useMentorRequests(appToken);

    // --- Handlers ---
    const handleApplicationUpdated = useCallback(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleApplicationDeleted = useCallback((id: string) => {
        deleteApplication(id);
    }, [deleteApplication]);

    const openEditModal = (application: Application) => {
        console.log(`Placeholder: Attempting to open edit modal for: ${application.schoolName}`);
    };
    
    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />

            <ModalProvider
                applications={applications}
                onDragEnd={onDragEnd as (result: any) => void}
                currentUserUid={appCurrentUser?.uid}
                handleCVUpload={handleCVUpload}
                handleNewCVRequest={handleNewCVRequest}
                handleRequestSOPWriting={handleRequestSOPWriting}
                handleSendMentorRequest={handleSendMentorRequest}
                userGroups={userGroups}
                cvRequest={typedCVRequest} 
                
                onApplicationUpdated={handleApplicationUpdated}
                onApplicationDeleted={handleApplicationDeleted}
                openEditModal={openEditModal}
                // 🟢 PASS SOP stats to the ModalProvider
                userSOPStats={userSOPStats} 
            >
                <AppContent 
                    applications={applications} 
                    onDragEnd={onDragEnd as (result: DropResult) => Promise<void>}
                    onRefreshApplications={fetchApplications}
                    userSOPStats={userSOPStats}
                /> 
            </ModalProvider>
        </>
    );
};

export default App;
