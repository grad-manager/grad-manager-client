// src/pages/ProjectsPage.tsx - PROFESSIONALLY STYLED
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    FaPlus,
    FaSpinner,
    FaSignInAlt,
    FaFolderOpen,
    FaArrowLeft,
    FaChevronDown,
    FaChevronUp,
    FaUserFriends,
    FaBullseye,
    FaCrown,
    FaLock,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SuccessToast from '../components/common/Toasts/SuccessToast';
import ErrorToast from '../components/common/Toasts/ErrorToast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { getEffectivePlanLabel } from '../utils/trial';
import TrialBanner from '../components/TrialBanner';

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
    id: string;
    title: string;
    goals: string;
    description: string;
    creatorName: string;
    members: string[];
    // NOTE: The backend currently returns `pendingRequests` as an array of request objects
    // (e.g., { userId, requestedAt, ... }). Use `any[]` here to reflect that shape
    // and avoid type errors when accessing `req.userId` in the UI logic.
    pendingRequests: any[]; 
}

// Define the plan types used in the backend (canonical values)
type Plan = 'Free' | 'Pro'; 

// --- SUBSCRIPTION LOGIC DEFINITION ---
// Match the backend logic (Free=1, Pro=Infinity)
const SUBSCRIPTION_LIMITS: Record<Plan, { maxJoinedProjects: number }> = {
    Free: { maxJoinedProjects: 1 }, // Free: 1 project
    Pro: { maxJoinedProjects: Infinity }, // Pro: unlimited
};

const ProjectsPage: React.FC = () => {
    // --- AUTH AND STATE ---
    const { currentUser: authUser, userProfile, token, refreshUserData } = useAuth() as any;
    
    const currentPlan: Plan = getEffectivePlanLabel(userProfile);
    const limits = SUBSCRIPTION_LIMITS[currentPlan];

    // 🛑 FIX 2: Use the projectCount field from the user object for the check, 
    // as intended by the backend logic.
    const currentJoinedProjects = useMemo(() => {
        // Use the count field directly from the user object (backend source of truth)
        // If projectCount is negative, default it to 0.
        return Math.max(0, userProfile?.projectCount || 0);
    }, [userProfile?.projectCount]);


    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', goals: '', description: '' });
    const [joinStatus, setJoinStatus] = useState<Record<string, 'requested' | 'member' | 'none'>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const navigate = useNavigate();

    // --- COMPUTED VALUES FOR SUBSCRIPTION CHECK ---
    const canCreateOrJoinProject = useMemo(() => {
        // If the limit is Infinity (Pro), allow it. Otherwise, check the count.
        return limits.maxJoinedProjects === Infinity || currentJoinedProjects < limits.maxJoinedProjects;
    }, [currentJoinedProjects, limits.maxJoinedProjects]);

    // Function to show a toast message for upgrade
    const showUpgradeToast = (action: 'join' | 'create') => {
        const nextPlan = 'Pro';

        const currentLimitDisplay = limits.maxJoinedProjects === Infinity ? 'Unlimited' : limits.maxJoinedProjects;

        const message = action === 'create'
            ? `You have reached your limit of ${currentLimitDisplay} projects. Upgrade to ${nextPlan} to create more!`
            : `You have reached your limit of ${currentLimitDisplay} projects. Upgrade to ${nextPlan} for higher limits or unlimited access.`;

        toast.error(<ErrorToast message={message} icon={<FaCrown />} />);
    };

    // --- API CALLS & HANDLERS ---

    // Toggle expanded project details
    const toggleDetails = (projectId: string) => {
        setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
    };

    // Fetch projects
    const fetchProjects = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedProjects: Project[] = response.data;
            setProjects(fetchedProjects);

            // Build joinStatus mapping
            const initialStatus = fetchedProjects.reduce((acc: Record<string, 'requested' | 'member' | 'none'>, project) => {
                const isUserMember = project.members.includes(authUser?.uid as string);
                // The `pendingRequests` array on the project document stores request *objects* on the backend 
                // but the frontend check assumes an array of IDs. We rely on the `members` array 
                // and the backend API's response to determine current status.
                // For simplicity on the frontend, we use the `project.members` array 
                // and the assumption that the project count is the true source of limits.
                
                // NOTE: The backend API must ensure that `project.pendingRequests` 
                // in the response data is an array of USER IDs for this frontend check to be fully accurate.
                // Based on your current backend code structure, `pendingRequests` is an array of objects
                // and the initial request added the CREATOR ID as an object, not just an ID.
                // We'll stick to the simpler UI checks for now and rely on the `projectCount` for limits.
                
                const isUserRequested = project.pendingRequests.some((req: any) => req.userId === authUser?.uid);

                if (isUserMember) acc[project.id] = 'member';
                else if (isUserRequested) acc[project.id] = 'requested';
                else acc[project.id] = 'none';

                return acc;
            }, {});
            setJoinStatus(initialStatus);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error(<ErrorToast message="Failed to load projects." />);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Refetch projects when token or user data (including projectCount) changes
        fetchProjects();
    }, [token, authUser?.uid, userProfile?.projectCount]); 

    // Request to join
    const handleJoinRequest = async (projectId: string) => {
        if (!token || joinStatus[projectId] !== 'none') return;

        if (!canCreateOrJoinProject) {
            showUpgradeToast('join');
            return;
        }

        // Optimistic UI update - mark as requested immediately
        setJoinStatus(prev => ({ ...prev, [projectId]: 'requested' }));
        
        try {
            // The backend handles the projectCount increment and the limit check again
            await axios.post(`${API_URL}/projects/${projectId}/join-request`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Refresh local user profile so projectCount updates are reflected immediately
            try { await refreshUserData(); } catch (e) { console.warn('refreshUserData failed:', e); }
            toast.success(<SuccessToast message="Join request sent successfully! An admin will review it." />);
            
            // NOTE: We rely on the backend to update projectCount and Firebase to send that 
            // back to the client via a listener on the user object, which will trigger the useEffect.
            
        } catch (error: any) {
            console.error('Error sending join request:', error);
            
            // Check for specific 403 response from backend (if available)
            if (error.response && error.response.status === 403) {
                 toast.error(<ErrorToast message={error.response.data.message || "You have reached your project limit."} icon={<FaCrown />} />);
            } else {
                 toast.error(<ErrorToast message="Failed to send join request. Please try again." />);
            }
            
            // Rollback optimistic UI
            setJoinStatus(prev => ({ ...prev, [projectId]: 'none' }));
        }
    };

    // Create project
    const handleCreateProject = async () => {
        if (!token) return;

        // Check limits before allowing creation 
        if (!canCreateOrJoinProject) {
            setIsConfirmModalOpen(false);
            showUpgradeToast('create');
            return;
        }
        
        setIsConfirmModalOpen(false);
        setSubmitLoading(true);

        try {
            await axios.post(`${API_URL}/projects`, newProject, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Refresh user profile immediately to reflect the new pending project slot
            try { await refreshUserData(); } catch (e) { console.warn('refreshUserData failed:', e); }
            toast.success(<SuccessToast message="Project submitted for admin approval! You'll be notified when it's live." />);
            setNewProject({ title: '', goals: '', description: '' });
            setIsCreatingProject(false);
            fetchProjects(); // Refresh the list
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error(<ErrorToast message="Failed to create project. Please try again." />);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEnterProject = (projectId: string) => {
        navigate(`/project-room/${projectId}`);
    };

    // --- DYNAMIC BUTTON RENDERING ---
    // Button based on status
    const getButton = (projectId: string) => {
        const status = joinStatus[projectId];
        const baseClass =
            'font-semibold py-2 px-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2 w-full md:w-auto text-sm';
        
        // Disable joining if limit is reached AND user is not a member/requested
        const isLimitReached = !canCreateOrJoinProject && status === 'none';

        if (status === 'member') {
            return (
                <button
                    onClick={() => handleEnterProject(projectId)}
                    className={`${baseClass} bg-green-600 text-white hover:bg-green-700 shadow-lg`}
                >
                    <FaSignInAlt />
                    <span>Enter Room</span>
                </button>
            );
        } else if (status === 'requested') {
            return (
                <button className={`${baseClass} bg-yellow-500 text-white cursor-not-allowed shadow-md`} disabled>
                    <FaSpinner className="animate-spin" />
                    <span>Request Pending</span>
                </button>
            );
        } else if (isLimitReached) {
             return (
                 <button 
                     onClick={() => navigate('/subscribe')} // Go to subscription page
                     className={`${baseClass} bg-gray-400 text-white cursor-pointer shadow-md hover:bg-gray-500`}
                 >
                     <FaLock />
                     <span>Upgrade to Join</span>
                 </button>
             );
        } else {
            return (
                <button
                    onClick={() => handleJoinRequest(projectId)}
                    className={`${baseClass} bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg`}
                >
                    <FaPlus />
                    <span>Join Project</span>
                </button>
            );
        }
    };

    // --- RENDER COMPONENT ---
    return (
        <section className="min-h-screen bg-gray-50 mt-4 py-10 sm:py-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <TrialBanner userProfile={userProfile} />
                {/* Header and Controls */}
                <div className="flex flex-col md:flex-row mt-12 justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center mb-4 md:mb-0">
                        <FaFolderOpen className="mr-3 text-indigo-600" />
                        Community Projects Hub
                    </h1>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors font-semibold py-2 px-4 rounded-full shadow-sm"
                        >
                            <FaArrowLeft className="mr-2" /> Dashboard
                        </button>
                        <button
                            onClick={() => {
                                if (isCreatingProject || canCreateOrJoinProject) {
                                    setIsCreatingProject(!isCreatingProject);
                                } else {
                                    showUpgradeToast('create');
                                }
                            }}
                            className={`text-white font-semibold py-2 px-4 rounded-full shadow-xl transition-all duration-300 flex items-center space-x-2 ${
                                canCreateOrJoinProject || isCreatingProject 
                                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                                    : 'bg-gray-500 hover:bg-gray-600'
                            }`}
                        >
                            <FaPlus />
                            <span>{isCreatingProject ? 'Cancel Proposal' : 'Propose New Project'}</span>
                        </button>
                    </div>
                </div>

                {/* --- Beautiful Header Message --- */}
                <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-900 p-4 mb-10 rounded-lg shadow-lg">
                    <div className="flex items-center">
                        <FaBullseye className="text-2xl mr-3 flex-shrink-0" />
                        <p className="font-medium text-sm sm:text-base">
                            <strong>Ignite Collaboration:</strong> Explore and contribute to impactful community projects, or propose your own idea to find the perfect team.
                            <br/>
                            <span className='text-xs text-indigo-700'>
                                Current Plan: <span className='font-bold uppercase'>{currentPlan}</span> | 
                                Projects Joined: <span className='font-bold'>{currentJoinedProjects}</span> / <span className='font-bold'>{limits.maxJoinedProjects === Infinity ? 'Unlimited' : limits.maxJoinedProjects}</span>
                            </span>
                            {currentPlan !== 'Pro' && (
                                <button
                                    onClick={() => navigate('/subscribe')}
                                    className="ml-4 inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                                >
                                    Upgrade Plan
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Create Project Form */}
                <AnimatePresence>
                    {isCreatingProject && (
                        <motion.div 
                            initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white p-6 md:p-8 rounded-xl shadow-2xl mb-10 overflow-hidden border border-indigo-200"
                        >
                            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">New Project Proposal</h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setIsConfirmModalOpen(true);
                                }}
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                        <input
                                            type="text"
                                            value={newProject.title}
                                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors placeholder-gray-400"
                                            placeholder="e.g., Open Source API Documentation Tool"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Goals (What is the project meant to achieve?)</label>
                                            <textarea
                                                value={newProject.goals}
                                                onChange={(e) => setNewProject({ ...newProject, goals: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-28 resize-none transition-colors placeholder-gray-400"
                                                placeholder="Outline the main objectives and expected outcome."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Detailed breakdown and required skills)</label>
                                            <textarea
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-28 resize-none transition-colors placeholder-gray-400"
                                                placeholder="Detail the scope and mention specific technologies/skills needed (React, Node.js, Design, etc.)."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                        disabled={submitLoading || !newProject.title || !newProject.goals || !newProject.description}
                                    >
                                        {submitLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className='mr-2' />}
                                        <span>Submit Project Proposal</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Projects List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {loading ? (
                        // Loading State
                        <div className="lg:col-span-2 xl:col-span-3 text-center p-16 bg-white rounded-xl shadow-xl">
                            <FaSpinner className="animate-spin mx-auto text-indigo-600 text-5xl" />
                            <p className="mt-6 text-xl text-gray-600 font-medium">Fetching active projects from the community...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        // Empty State
                        <div className="lg:col-span-2 xl:col-span-3 text-center p-16 bg-white rounded-xl shadow-xl border-dashed border-2 border-gray-300">
                            <FaFolderOpen className="mx-auto text-gray-400 text-5xl" />
                            <p className="mt-4 text-xl text-gray-500 italic">
                                No active projects available. Be the first to **Propose a New Project**!
                            </p>
                        </div>
                    ) : (
                        // Project Cards
                        <AnimatePresence>
                            {projects.map((project) => {
                                const isExpanded = expandedProjectId === project.id;
                                return (
                                    <motion.div
                                        key={project.id}
                                        className="bg-white rounded-xl shadow-xl flex flex-col border-t-4 border-indigo-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        layout
                                    >
                                        {/* Card Header and Summary */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Created by: <span className="font-semibold text-gray-700">{project.creatorName}</span>
                                            </p>
                                            <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4">
                                                <div className="flex items-center p-1 px-2 bg-indigo-50 rounded-full text-indigo-600 font-medium">
                                                    <FaUserFriends className="mr-1 text-xs" />
                                                    <span>{project.members.length} Members</span>
                                                </div>
                                                {project.pendingRequests.length > 0 && (
                                                    <div className="flex items-center p-1 px-2 bg-yellow-50 rounded-full text-yellow-600 font-medium">
                                                        <FaSpinner className="mr-1 text-xs" />
                                                        <span>{project.pendingRequests.length} Pending</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Details Section */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="px-6 pt-0 pb-6 border-t border-gray-200 bg-gray-50 overflow-hidden"
                                                >
                                                    <div className="mt-4">
                                                        <p className="text-gray-800 font-bold mb-1 border-b border-gray-200 pb-1 flex items-center"><FaBullseye className='text-indigo-500 mr-2'/> Goals:</p>
                                                        <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{project.goals}</p>
                                                        
                                                        <p className="text-gray-800 font-bold mb-1 border-b border-gray-200 pb-1 flex items-center"><FaFolderOpen className='text-indigo-500 mr-2'/> Description/Skills Needed:</p>
                                                        <p className="text-sm text-gray-700 italic whitespace-pre-wrap">{project.description}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Action Bar (Stuck to bottom) */}
                                        <div className={`p-4 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row space-y-3 sm:space-y-0 ${isExpanded ? 'sm:justify-start sm:space-x-3' : 'sm:justify-between sm:space-x-4'}`}>
                                            {/* Toggle Details Button */}
                                            <button
                                                onClick={() => toggleDetails(project.id)}
                                                className={`font-semibold py-2 px-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2 text-indigo-600 border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 w-full ${isExpanded ? 'sm:w-auto' : 'sm:w-1/2'}`}
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <FaChevronUp className="text-xs" />
                                                        <span>Hide Details</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaChevronDown className="text-xs" />
                                                        <span>View Details</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* Join/Enter Button */}
                                            <div className={isExpanded ? 'sm:w-auto' : 'sm:w-1/2'}>
                                                {getButton(project.id)}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                onConfirm={handleCreateProject}
                title="Confirm Project Submission"
                message="You are about to submit your project proposal for admin review. It will be posted to the community upon approval. Do you want to proceed?"
                confirmButtonText="Submit Proposal"
                cancelButtonText="Cancel"
            />
        </section>
    );
};

export default ProjectsPage;
