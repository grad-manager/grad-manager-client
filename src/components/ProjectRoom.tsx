import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaSpinner, FaUsers, FaArrowLeft, FaFileAlt, FaImage, FaMicrophone, FaUpload, FaDownload, FaTimes, FaCrown, FaClipboardList } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getEffectivePlanLabel } from '../utils/trial';
import TrialBanner from '../components/TrialBanner';

// IMPORTANT: Ensure VITE_API_URL and VITE_VAPID_PUBLIC_KEY are set in your .env file
const API_URL = import.meta.env.VITE_API_URL; 

// --- REUSED INTERFACES ---
interface FileData {
    fileName: string;
    fileUrl: string;
    fileType: 'image' | 'voice' | 'document';
}

interface FirestoreTimestamp { toDate: () => Date }

interface Idea {
    id: string;
    userId: string;
    userName: string;
    content: string; // Used for text content/caption
    createdAt: FirestoreTimestamp | null;
    file?: FileData;
}

interface ProjectDetails {
    id: string;
    title: string;
    goals: string;
    description: string;
    creatorId: string;
    members: string[];
}
// --- END REUSED INTERFACES ---

// --- NEW/UPDATED CONSTANTS & HELPERS ---
const PROJECT_LIMITS = {
    'Free': 1, // Changed to 1 based on 'Join ongoing project: 1 project' in the image
        'Pro': Infinity, // Unlimited projects
};

const getFileType = (mimeType: string): 'image' | 'voice' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'voice';
    return 'document';
};
// --- END NEW/UPDATED CONSTANTS & HELPERS ---


// --- IDEA CONTENT RENDERER (Unchanged) ---
const IdeaContent: React.FC<{ idea: Idea; isSender: boolean }> = ({ idea, isSender }) => {
    const textColor = isSender ? 'text-white' : 'text-neutral-200';
    const linkColor = isSender ? 'text-white/80' : 'text-primary/70';
    const linkHoverColor = isSender ? 'text-white' : 'text-primary';

    return (
        <div className='flex flex-col'>
            {idea.file && (
                <div className={`${idea.content ? 'mb-2' : ''}`}>
                    {idea.file.fileType === 'image' && (
                        <img
                            src={idea.file.fileUrl}
                            alt={idea.file.fileName}
                            loading="lazy"
                            className="w-full max-h-64 object-contain rounded-xl mb-2 cursor-pointer transition-opacity hover:opacity-90"
                            onClick={() => window.open(idea.file!.fileUrl, '_blank')}
                        />
                    )}
                    {idea.file.fileType === 'voice' && (
                        <div className="flex items-center space-x-3 bg-white/30 p-2 rounded-full mb-2">
                            <FaMicrophone size={20} className={textColor} />
                            <audio controls src={idea.file.fileUrl} className="w-full"></audio>
                        </div>
                    )}
                    {idea.file.fileType === 'document' && (
                        <a
                            href={idea.file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center space-x-2 p-3 rounded-lg bg-neutral-700/50 font-medium transition-colors mb-2 ${linkColor} hover:${linkHoverColor}`}
                        >
                            <FaFileAlt size={18} />
                            <span className="truncate max-w-[calc(100%-40px)]">{idea.file.fileName}</span>
                            <FaDownload size={12} className='ml-auto' />
                        </a>
                    )}
                </div>
            )}

            {idea.content && <p className={`break-words text-sm sm:text-base ${textColor}`}>{idea.content}</p>}
        </div>
    );
};
// --- END IDEA CONTENT RENDERER ---

const ProjectRoom: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { currentUser, token, userProfile } = useAuth();
    // Start with currentUser.displayName, but update with Firestore value if available
    const [reliableUserName, setReliableUserName] = useState<string>(currentUser?.displayName || 'Anonymous'); 

    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [newIdea, setNewIdea] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const ideasContainerRef = useRef<HTMLDivElement>(null);

    // --- SUBSCRIPTION LOGIC ---
    const userSubscriptionPlan = getEffectivePlanLabel(userProfile);
    const [currentProjectsCount, setCurrentProjectsCount] = useState<number>(0);
    const projectLimit = PROJECT_LIMITS[userSubscriptionPlan];
    // Can contribute if the user has a Premium/Pro plan, regardless of project limit
const canSubmitIdea = userSubscriptionPlan === 'Pro';
    // Cannot join a project if the current count is at or over the limit
    const isAtProjectLimit = currentProjectsCount >= projectLimit && projectLimit !== Infinity; 
    // --- END SUBSCRIPTION LOGIC ---
    
    // --- NEW: Function to simulate fetching user's joined project count ---
    const fetchJoinedProjectsCount = useCallback(async (userId: string) => {
        if (!userId) return 0;
        try {
            // NOTE: This assumes an index on the 'members' array in the 'projects' collection
            const projectsQuery = query(
                collection(db, 'projects'),
                where('members', 'array-contains', userId)
            );
            const snapshot = await getDocs(projectsQuery);
            return snapshot.size;
        } catch (err) {
            console.error("Error fetching joined project count:", err);
            return 0;
        }
    }, []);
    // --- END NEW FUNCTION ---


    // Auto-scroll to the bottom whenever a new idea is added
    useEffect(() => {
        if (ideasContainerRef.current) {
            // Use requestAnimationFrame for smoother scrolling after DOM update
            requestAnimationFrame(() => {
                if (ideasContainerRef.current) {
                    ideasContainerRef.current.scrollTop = ideasContainerRef.current.scrollHeight;
                }
            });
        }
    }, [ideas]);

    // Fetch User's Name AND Project Count from Firestore
    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const fetchUserData = async () => {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userDocRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        
                        // Name Logic
                        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                        if (fullName) {
                            setReliableUserName(fullName);
                        } else {
                            setReliableUserName(currentUser.displayName || 'Anonymous');
                        }

                    } else {
                        setReliableUserName(currentUser.displayName || 'Anonymous');
                    }

                    // --- NEW: Fetch and set current project count ---
                    const count = await fetchJoinedProjectsCount(currentUser.uid);
                    setCurrentProjectsCount(count);
                    // --- END NEW ---

                } catch (error) {
                    console.error('Error fetching user data from Firestore:', error);
                    setReliableUserName(currentUser.displayName || 'Anonymous');
                }
            // eslint-disable-next-line react-hooks/exhaustive-deps
                };
            fetchUserData();
        } else {
            setReliableUserName('Anonymous');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, fetchJoinedProjectsCount]); // Added fetchJoinedProjectsCount as dependency

    // --- PUSH NOTIFICATION SUBSCRIPTION LOGIC (Unchanged from original) ---
    useEffect(() => {
        const subscribeUserToPush = async (token: string) => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                return console.warn('Push notifications not fully supported.');
            }

            try {
                // Check for existing subscription first (optional optimization)
                const registration = await navigator.serviceWorker.ready;
                let subscription = await registration.pushManager.getSubscription();
                
                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        // This must be a base64url-encoded VAPID public key
                        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY, 
                    });
                }
                
                // Send subscription to your backend
                await fetch(`${API_URL}/push/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(subscription),
                });

                console.log('✅ User subscribed to push successfully.');
            } catch (err) {
                console.error('❌ Push subscription failed:', err);
                // The most common error here is 'Permission denied' by the user
                if (Notification.permission === 'denied') {
                     console.warn('User explicitly denied notification permission.');
                }
            }
        };

        // Only attempt to subscribe if we have a token (user is logged in)
        if (token && Notification.permission !== 'denied') {
            subscribeUserToPush(token);
        }
    }, [token]);
    // --- END PUSH NOTIFICATION SUBSCRIPTION LOGIC ---


    // File Handlers (Updated to use canSubmitIdea)
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Now checks canSubmitIdea which is Premium/Pro
        if (!canSubmitIdea) {
            setError("Upgrade to Pro to attach files.");
            event.target.value = '';
            setFileToUpload(null);
            return;
        }

        setError(null);
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.size > 20 * 1024 * 1024) {
                setError('File size exceeds 20MB limit.');
                event.target.value = '';
                setFileToUpload(null);
                return;
            }
            setFileToUpload(file);
        }
    };

    const handleCancelFile = () => {
        setFileToUpload(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    // Fetch project data and set up a real-time listener for ideas (Unchanged logic)
    useEffect(() => {
        if (!projectId || !currentUser) {
            setLoading(false);
            return;
        }

        const fetchProjectAndIdeas = async () => {
            let unsubscribeIdeas: (() => void) | undefined;
            
            try {
                const projectRef = doc(db, 'projects', projectId);
                const projectSnap = await getDoc(projectRef);

                if (!projectSnap.exists()) {
                    setError("Project not found.");
                    setLoading(false);
                    return;
                }

                const projectData = projectSnap.data() as ProjectDetails;

                // We'll trust the user to only be in this room if they've successfully joined, 
                // but we keep the guard for security/state correctness.
                if (!projectData.members.includes(currentUser.uid)) {
                    setError("Access denied. You are not a member of this project.");
                    setLoading(false);
                    return;
                }

                setProject({ ...projectData, id: projectSnap.id });

                const ideasQuery = query(collection(db, 'projects', projectId, 'ideas'), orderBy('createdAt'));
                
                // Set up the real-time listener
                unsubscribeIdeas = onSnapshot(ideasQuery, (querySnapshot) => {
                    const fetchedIdeas: Idea[] = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data() as Omit<Idea, 'id'>;
                        const idea: Idea = {
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt as FirestoreTimestamp | null,
                        };
                        fetchedIdeas.push(idea);
                    });

                    setIdeas(fetchedIdeas);
                    setLoading(false);
                });

            } catch (err) {
                console.error('Failed to fetch project data:', err);
                setError("Failed to load project. Please check your connection.");
                setLoading(false);
            }
            
            // Cleanup function for the listener
            return () => {
                if(unsubscribeIdeas) {
                    unsubscribeIdeas();
                }
            };
        };

        fetchProjectAndIdeas();
    }, [projectId, currentUser]);


    // --- UPDATED SUBMIT HANDLER (Uses reliableUserName and added notification trigger) ---
    const handleSubmitIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        const ideaText = newIdea.trim();
        setError(null);

        // --- Subscription Guard Clause (For contribution rights) ---
        if (!canSubmitIdea) {
            setError(`Upgrade to Pro to submit new ideas and documents to this project. Your current plan is: ${userSubscriptionPlan}`);
            setNewIdea('');
            handleCancelFile();
            return;
        }
        // ---------------------------------

        if ((ideaText === '' && !fileToUpload) || !currentUser || !projectId) return;

        // Ensure we have a token for any submission, especially file uploads or notifications
        if (!token) {
            setError('Authentication required. Please log in again.');
            return;
        }

        setSubmitLoading(true);
        let ideaDataToSend: Omit<Idea, 'id' | 'createdAt'>;
        const userNameToUse = reliableUserName === 'Anonymous' 
            ? currentUser.displayName || 'Anonymous' // Fallback if Firestore fetch failed but displayName existed
            : reliableUserName;


        try {
            let fileData: FileData | undefined;

            if (fileToUpload) {
                // 1. Upload File
                const formData = new FormData();
                formData.append('document', fileToUpload);
                const clientFileType = getFileType(fileToUpload.type);
                formData.append('fileType', clientFileType);

                const uploadResponse = await axios.post(`${API_URL}/applications/chat/documents`, formData, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data', },
                });

                const uploadedDoc = uploadResponse.data;
                fileData = {
                    fileName: uploadedDoc.fileName,
                    fileUrl: uploadedDoc.fileUrl,
                    fileType: uploadedDoc.fileType,
                };
                handleCancelFile(); // Clear file input after successful upload
            }

            // 2. Prepare Firestore data
            ideaDataToSend = {
                userId: currentUser.uid,
                userName: userNameToUse, // <-- USE THE RELIABLE NAME
                content: ideaText,
                ...(fileData ? { file: fileData } : {}), // Conditionally include file data
            };

            // 3. Save message/idea to Firestore
            const ideasRef = collection(db, 'projects', projectId, 'ideas');
            await addDoc(ideasRef, { 
                ...ideaDataToSend,
                createdAt: serverTimestamp(),
            });


            // 4. Send Push Notification Trigger to Backend
            await axios.post(`${API_URL}/projects/${projectId}/notify`, {
                senderId: currentUser.uid,
                senderName: userNameToUse, // <-- USE THE RELIABLE NAME HERE TOO
                content: ideaText || (fileData ? `[${fileData.fileType.toUpperCase()} Attached]` : '[New Idea]'),
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('🚀 Notification request sent to backend.');


            // 5. Reset form state
            setNewIdea('');

        } catch (err) {
            console.error('Failed to submit idea/upload file/notify:', err);
            const errorMessage = axios.isAxiosError(err) && err.response?.status === 401
                ? 'Unauthorized. Please check your login status.'
                : 'Failed to submit idea. Please check the file and try again.';
            setError(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };
    // --- END UPDATED SUBMIT HANDLER ---


    // Loading state (Unchanged)
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-950">
                <FaSpinner className="animate-spin text-primary text-6xl" />
            </div>
        );
    }

    // Error and not-found state (Unchanged)
    if (error && !loading && !project) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-neutral-950 text-white">
                <p className="text-xl font-semibold mb-4">{error}</p>
                <a href="/" className="flex items-center text-primary hover:underline transition-colors">
                    <FaArrowLeft className="mr-2" /> Go back to Dashboard
                </a>
            </div>
        );
    }

    // Main component content
    return (
        <section className="min-h-screen w-full mt-16 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 py-10 sm:py-16 px-4">
            <div className="max-w-7xl mx-auto px-2 sm:px-6">
                <TrialBanner userProfile={userProfile} />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                {/* Project Header Card */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-white/20"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex justify-between items-start mb-4 flex-wrap">
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                            {project?.title}
                        </h1>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                            userSubscriptionPlan === 'Pro' ? 'bg-indigo-600 text-white' : 
'bg-neutral-500 text-white'
                        }`}>
                            Plan: {userSubscriptionPlan}
                        </span>
                    </div>
                    <p className="text-neutral-300 text-base sm:text-lg mb-4">{project?.description}</p>

                    {/* --- Project Limit Display --- */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-b border-white/20 py-3 mt-4">
                        <div className="flex items-center text-neutral-400 text-sm mb-2 sm:mb-0">
                            <FaUsers className="mr-2 text-primary" />
                            <span>This Project: {project?.members.length} Members</span>
                        </div>
                        
                        {projectLimit !== Infinity ? (
                            <div className={`flex items-center text-sm font-semibold ${isAtProjectLimit ? 'text-red-400' : 'text-green-400'}`}>
                                <FaClipboardList className="mr-2" />
                                **Project Limit:** {currentProjectsCount} / {projectLimit} Joined
                            </div>
                        ) : (
                            <div className="flex items-center text-sm font-semibold text-indigo-400">
                                <FaCrown className="mr-2" />
                                **Project Limit:** Unlimited
                            </div>
                        )}

                        {isAtProjectLimit && userSubscriptionPlan !== 'Pro' && (
                            <Link 
                                to="/upgrade" 
                                className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full hover:bg-yellow-700 transition-colors mt-2 sm:mt-0"
                            >
                                Upgrade for More Projects
                            </Link>
                        )}
                    </div>
                    {/* --- End Project Limit Display --- */}

                </motion.div>

                {/* Project Chat Interface */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-4 sm:p-6 border border-white/20 flex flex-col h-[70vh] md:h-[80vh]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Project Whiteboard</h2>
                    <div
                        ref={ideasContainerRef}
                        className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4"
                    >
                        <AnimatePresence>
                            {ideas.length === 0 ? (
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-center text-neutral-400 italic">
                                        No ideas shared yet. Be the first to add a sticky note! 📝
                                    </p>
                                </div>
                            ) : (
                                ideas.map((idea) => {
                                    const isSender = idea.userId === currentUser?.uid;

                                    const formattedTime = idea.createdAt && typeof idea.createdAt.toDate === 'function'
                                        ? idea.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : 'Pending...';

                                    return (
                                        <motion.div
                                            key={idea.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex mb-2 ${isSender ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`p-3 sm:p-4 rounded-xl shadow-lg relative max-w-[80%] md:max-w-[60%] ${
                                                    isSender
                                                        ? 'bg-primary/80 text-white rounded-br-none'
                                                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none'
                                                }`}
                                            >
                                                <IdeaContent idea={idea} isSender={isSender} />

                                                <div
                                                    className={`flex items-center mt-2 text-xs ${
                                                        isSender ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    <span className="text-neutral-400 mr-2">{idea.userName}</span>
                                                    <span className="text-neutral-400 mr-1">
                                                        {formattedTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>

                    {/* --- Error Display --- */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 my-2 bg-red-800/70 text-white rounded-lg text-sm"
                            >
                                **Error:** {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* --- End Error Display --- */}


                    {/* --- File Preview Area --- */}
                    {fileToUpload && (
                        <div className="p-3 md:p-4 bg-neutral-800/50 border-t border-white/10 flex items-center justify-between text-white text-sm rounded-b-xl">
                            <div className="flex items-center space-x-3">
                                <span className="p-2 bg-white/20 rounded-full">
                                    {fileToUpload.type.startsWith('image/') ? <FaImage /> : fileToUpload.type.startsWith('audio/') ? <FaMicrophone /> : <FaFileAlt />}
                                </span>
                                <span className="truncate max-w-[200px]">{fileToUpload.name}</span>
                            </div>
                            <button onClick={handleCancelFile} className="p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Cancel file upload">
                                <FaTimes />
                            </button>
                        </div>
                    )}
                    {/* --- END: File Preview Area --- */}

                    {/* --- SUBSCRIPTION UPGRADE CTA --- */}
                    {/* Note: canSubmitIdea controls submission rights (Pro) */}
                    {!canSubmitIdea && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 my-2 bg-yellow-600/70 text-white rounded-lg text-center font-semibold"
                        >
                            <p className='mb-2'>⚠️ **{userSubscriptionPlan} Plan Limit:** You can view ideas, but you need to upgrade to **Pro** to **contribute ideas** and **attach files** to the Project Whiteboard.</p>
                            {/* Assuming '/upgrade' is the correct route for the pricing page */}
                            <Link to="/upgrade" className="inline-flex items-center justify-center bg-white text-yellow-800 p-2 px-4 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                                <FaCrown className="mr-2" /> View Plans & Upgrade
                            </Link>
                        </motion.div>
                    )}
                    {/* --- END SUBSCRIPTION UPGRADE CTA --- */}


                    {/* Idea submission form */}
                    <form
                        onSubmit={handleSubmitIdea}
                        className={`flex items-end space-x-2 ${fileToUpload ? 'mt-0' : 'mt-4'}`}
                    >
                        {/* File Input Button */}
                        <label 
                            htmlFor="file-upload" 
                            className={`flex items-center justify-center p-3 sm:p-4 text-white rounded-full h-fit transition-colors duration-300 ${
                                canSubmitIdea ? 'bg-neutral-700/80 hover:bg-neutral-700 cursor-pointer' : 'bg-neutral-700/50 cursor-not-allowed opacity-60'
                            }`}
                            title={canSubmitIdea ? "Attach File" : "Upgrade to attach files"}
                        >
                            <FaUpload />
                            <input
                                id="file-upload"
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                disabled={!canSubmitIdea} // Disable file input based on plan
                            />
                        </label>

                        <textarea
                            value={newIdea}
                            onChange={(e) => setNewIdea(e.target.value)}
                            placeholder={canSubmitIdea ? (fileToUpload ? `Add a caption for ${fileToUpload.name}...` : "Share your idea...") : "Upgrade to send ideas"}
                            className="flex-grow p-3 sm:p-4 border border-neutral-700 bg-neutral-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/80 transition-colors placeholder-neutral-500 text-sm sm:text-base resize-none"
                            rows={fileToUpload ? 2 : 1}
                            disabled={submitLoading || !canSubmitIdea} // Disable textarea based on plan
                        /> 

                        <button
                            type="submit"
                            className="flex items-center justify-center bg-primary text-white p-3 sm:p-4 rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                            disabled={submitLoading || !canSubmitIdea || (!newIdea.trim() && !fileToUpload)} // Combined disabled check
                            title={canSubmitIdea ? "Send Idea" : "Upgrade to send ideas"}
                        >
                            {submitLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                        </button>
                    </form>

                </motion.div>
            </motion.div>
        </section>
    );
};

export default ProjectRoom;

