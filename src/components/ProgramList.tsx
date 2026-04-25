// src/components/ProgramList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Program } from "../types/Program";
// 👇 UPDATED IMPORT: Use the actual Firebase User type from your context/types
// We still need the User type but for custom properties, we'll use userProfile.
// The import below should point to the User and UserProfile interfaces.
import { useAuth } from "../context/AuthContext"; 

import {
    FaPlus,
    FaSpinner,
    FaSearch,
    FaSort,
    FaChevronDown,
    FaChevronUp,
    FaTimesCircle,
    FaPlusCircle,
    FaExclamationTriangle,
    FaLock, // 👈 ADDED: Lock icon for restricted content
} from "react-icons/fa";
import api from "../utils/api";
import { toast } from "react-toastify";
import SuccessToast from "./common/Toasts/SuccessToast";
import ErrorToast from "./common/Toasts/ErrorToast";
import SuggestProgramForm from './SuggestProgramForm';
import ScholarshipCatalog from "./ScholarshipCatalog";
import { getEffectivePlanLower } from "../utils/trial";

// --- Define Subscription Limits for Smart Application Tracker ---
const APPLICATION_LIMITS: Record<string, number> = {
    // Free: 2 checks/schools
    free: 2,      
    // Premium: 15 checks/schools
    premium: 15,  
    // Pro: Unlimited schools (using Number.POSITIVE_INFINITY for simplicity)
    pro: Number.POSITIVE_INFINITY, 
};
// ----------------------------------------------------------------

// --- SKELETON COMPONENT (Unchanged) ---
const ProgramSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mb-6"></div>

        {/* Placeholder for "View Details" button */}
        <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-28 mb-6"></div>

        {/* Placeholder for the two action buttons */}
        <div className="flex gap-3">
            <div className="h-10 flex-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-10 flex-1 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
        </div>
    </div>
);
// ------------------------------------

const ProgramList: React.FC = () => {
    // 💡 FIX: Destructure userProfile to get custom data
    const { currentUser, userProfile, token } = useAuth(); 

    // --- Subscription-related logic (Now using userProfile) ---
    // Safely access properties from userProfile (which holds custom data)
    const userPlan = getEffectivePlanLower(userProfile);
    const currentApplicationCount = userProfile?.applicationsCount || 0; 
    const maxApplications = APPLICATION_LIMITS[userPlan] || 2;
    const isLimitReached = currentApplicationCount >= maxApplications;
    // -----------------------------------------------------------

    // --- State for Loading and Programs (Unchanged) ---
    const [isFetching, setIsFetching] = useState(true);
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [addingStates, setAddingStates] = useState<Record<string, boolean>>({});

    // --- State for Modals/UI ---
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");

    const [fundingFilter] = useState("");
    const [sortOption, setSortOption] = useState("deadline");
    const [region, setRegion] = useState<"us" | "non-us">("us");
    const [catalogView, setCatalogView] = useState<"programs" | "scholarships">("programs");
    const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

    // Pagination states (server-driven)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const programsPerPage = 8;

    // Handler to perform the search (Unchanged)
    const handleSearch = useCallback(() => {
        setActiveSearchQuery(searchInput);
        setCurrentPage(1); // Reset to first page on new search
    }, [searchInput]);

    // Handler to clear the search (Unchanged)
    const handleClearSearch = useCallback(() => {
        setSearchInput("");
        if (activeSearchQuery !== "") {
            setActiveSearchQuery("");
            setCurrentPage(1);
        }
    }, [activeSearchQuery]);


    // Shuffle function to randomize program order
    const shufflePrograms = (programsToShuffle: Program[]): Program[] => {
        const shuffled = [...programsToShuffle];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Ensure University of Nairobi is not first
        const nairobiIndex = shuffled.findIndex(p => p.university?.toLowerCase().includes('nairobi'));
        if (nairobiIndex === 0 && shuffled.length > 1) {
            // Swap with a random other program
            const randomIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
            [shuffled[0], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[0]];
        }
        
        return shuffled;
    };

    // Fetch programs logic (Unchanged)
    const fetchPrograms = useCallback(async () => {
        // Use userProfile for checking auth status as well, though currentUser is usually cleaner
        if (!currentUser || !token) { 
            setIsFetching(false);
            return;
        }

        // 1. Set fetching to true to show loading indicator
        setIsFetching(true);

        try {
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("limit", programsPerPage.toString());
            params.append("sort", sortOption);

            if (activeSearchQuery) {
                params.append("search", activeSearchQuery);
            }
            if (fundingFilter) {
                params.append("funding", fundingFilter);
            }
            params.append("region", region);

            const url = `/programs?${params.toString()}`;

            const response = await api.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { data, totalPages: totalPagesData } = response.data;
            let programsData = data;

            // Shuffle programs for randomized display
            programsData = shufflePrograms(programsData);

            setPrograms(programsData);
            setTotalPages(totalPagesData);            // 2. Mark initial load complete
            setHasLoadedInitialData(true);

        } catch (error) {
            console.error("Failed to fetch programs:", error);
            // Only show a general error toast if it's the very first load
            if (!hasLoadedInitialData) {
                toast.error(() => <ErrorToast message="Failed to load programs. Please try again." />);
            }
        } finally {
            // 3. Set fetching to false when done
            setIsFetching(false);
        }
    }, [currentUser, token, activeSearchQuery, fundingFilter, sortOption, currentPage, hasLoadedInitialData, region]);

    useEffect(() => {
        // This effect runs on mount and whenever a dependency changes
        fetchPrograms();
    }, [fetchPrograms]);


    const handleAddToInterested = async (program: Program) => {
        if (!currentUser || !userProfile) { // Check for both basic auth and custom profile
            toast.error(() => <ErrorToast message="You must be logged in to add a program to your dashboard." />);
            return;
        }
        
        // --- Limit Check before API call ---
        if (isLimitReached) {
            const limitDisplay = maxApplications === Number.POSITIVE_INFINITY ? 'Unlimited' : maxApplications;
            toast.error(() => (
                <ErrorToast 
                    message={`Application limit of ${limitDisplay} reached for your ${userPlan.toUpperCase()} plan. Please upgrade for more tracking slots.`} 
                />
            ));
            return; // STOP the function if the limit is reached
        }
        // ----------------------------------------

        setAddingStates((prev) => ({ ...prev, [program.id]: true }));
        try {
            await api.post("/applications", {
                userId: currentUser.uid, // Use currentUser for the basic Firebase UID
                schoolName: program.university,
                programName: program.department,
                deadline: program.deadline || null,
                status: "Interested",
                funding: program.funding || null,
                fundingAmount: program.fundingAmount || null,
                greWaiver: program.greWaiver || null,
                ieltsWaiver: program.ieltsWaiver || null,
                appFeeWaiver: program.appFeeWaiver || null,
                requiredDocs: Array.isArray(program.requiredDocs)
                    ? program.requiredDocs
                    : program.requiredDocs
                        ? [program.requiredDocs]
                        : [],
                appLink: program.appLink || null,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(() => (
                <SuccessToast
                    message={`Successfully added ${program.department} at ${program.university} to your dashboard!`}
                />
            ));

            setPrograms((prev) =>
                prev.map((p) =>
                    p.id === program.id ? { ...p, alreadyAdded: true } : p
                )
            );
            // NOTE: Ideally, you should call a context function here to refresh/increment the userProfile.applicationsCount 
            // in state to keep the UI's limit check immediately accurate without a full page refresh.
        } catch (err: any) {
            console.error("Failed to add program:", err);
            if (err.response && err.response.status === 409) {
                toast.error(() => <ErrorToast message="This program has already been added to your dashboard." />);
                setPrograms((prev) =>
                    prev.map((p) =>
                        p.id === program.id ? { ...p, alreadyAdded: true } : p
                    )
                );
            } else if (err.response?.status === 403 && err.response?.data?.code === 'LIMIT_EXCEEDED') {
                toast.error(() => <ErrorToast message={`${err.response.data.message} Upgrade your plan to add more applications.`} />);
            } else {
                toast.error(() => <ErrorToast message="Failed to add program to your dashboard. Please try again." />);
            }
        } finally {
            setAddingStates((prev) => ({ ...prev, [program.id]: false }));
        }
    };

    // --- Loading State logic (Unchanged) ---
    const showSkeletons = isFetching && !hasLoadedInitialData;
    const showStaleOverlay = isFetching && hasLoadedInitialData;
    // ------------------------------------    

    // New function for the 'locked' content display
    const renderLockedInfo = (featureName: string) => (
        <Link to="/subscribe" className="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold hover:underline">
            <FaLock className="text-sm" />
            Upgrade to view {featureName}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sticky Top Bar */}
            <div className="sticky top-0 z-10 mt-28 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center px-6 py-4">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight mb-4 sm:mb-0 sm:mt-0">
                    Browse Programs
                </h1>
                <div className="flex gap-3">
                    {catalogView === "programs" && (
                    <>
                    {/* Suggest Program Button */}
                    <button
                        onClick={() => setShowSuggestionModal(true)}
                        className="bg-green-600 text-white font-semibold py-2 px-6 rounded-full shadow hover:bg-green-700 transition-colors flex items-center gap-2"
                        disabled={!currentUser}
                    >
                        <FaPlusCircle /> Suggest Program
                    </button>
                    </>
                    )}

                    <Link to="/" aria-label="Back to Dashboard">
                        <button className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow hover:bg-blue-700 transition-colors">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>

        <div className="px-6 pt-6">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <span className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
              Catalog
            </span>
            <button
              type="button"
              onClick={() => setCatalogView("programs")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                catalogView === "programs"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Programs
            </button>
            <button
              type="button"
              onClick={() => setCatalogView("scholarships")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                catalogView === "scholarships"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Scholarships
            </button>
          </div>
        </div>

			{/* Subscription banner moved to Application Tracker page. */}

{catalogView === "programs" ? (
          <>
{/* Controls (Unchanged) */}
            <div className="flex flex-col gap-4 md:gap-6 items-start md:items-center justify-center px-6 pt-0 pb-6">
        {/* Region Toggle */}
        <div className="w-full max-w-4xl mt-8 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Programs Region</span>
          <div className="inline-flex rounded-full border border-gray-200 bg-white shadow-sm p-1">
            <button
              onClick={() => { setRegion("us"); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${region === "us" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              US Programs
            </button>
            <button
              onClick={() => { setRegion("non-us"); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${region === "non-us" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Non-US Programs
            </button>
          </div>
        </div>
                {/* Search */}
                <div className="w-full max-w-4xl flex flex-col md:flex-row gap-2 md:gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                            placeholder="Search by university or department..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={!searchInput.trim() || isFetching}
                        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400 md:self-end"
                    >
                        {isFetching && activeSearchQuery === searchInput ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            "Search"
                        )}
                    </button>

                    {/* Clear Button */}
                    {activeSearchQuery && (
                        <button
                            onClick={handleClearSearch}
                            disabled={isFetching}
                            className="bg-red-500 text-white font-semibold py-3 px-3 rounded-xl shadow hover:bg-red-600 transition-colors flex items-center justify-center disabled:bg-gray-400 md:self-end"
                            aria-label="Clear Search"
                        >
                            <FaTimesCircle />
                        </button>
                    )}
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center w-full max-w-4xl justify-end">

                    {/* Sort */}
                    <div className="relative w-full md:w-52">
                        <FaSort className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            disabled={isFetching}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 shadow-sm appearance-none disabled:opacity-70"
                        >
                            <option value="deadline">Sort by Deadline</option>
                            <option value="funding">Sort by Funding</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Program Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
                    {/* Overlay for Stale Data */}
                    {showStaleOverlay && (
                        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
                            <FaSpinner className="animate-spin text-blue-600 dark:text-blue-400 text-3xl" />
                        </div>
                    )}

                    {showSkeletons ? (
                        // Initial load: Display Skeletons
                        Array.from({ length: programsPerPage }).map((_, index) => (
                            <ProgramSkeleton key={index} />
                        ))
                    ) : programs.length > 0 ? (
                        // Normal or Stale (Dimmed) view: Display Actual Programs
                        programs.map((program) => {
                            const isAdding = addingStates[program.id];
                            const isExpanded = expandedProgram === program.id;
                            
                            // Check if the add button should be disabled due to limits
                            const isDisabledByLimit = isLimitReached && !program.alreadyAdded;

                            return (
                                <article
                                    key={program.id}
                                    // Use opacity to dim the cards slightly when fetching new data
                                    className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl border border-gray-200 dark:border-gray-700 transition ${showStaleOverlay ? 'opacity-70' : ''}`}
                                >
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {program.department}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {program.university}
                                    </p>

                                    {/* Expand Details */}
                                    <button
                                        onClick={() =>
                                            setExpandedProgram(isExpanded ? null : program.id)
                                        }
                                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <FaChevronUp /> Hide Details
                                            </>
                                        ) : (
                                            <>
                                                <FaChevronDown /> View Details
                                            </>
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <dl className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                                            {/* Professors/Links (Conditional) */}
                                            {program.professors && (
                                                <div>
                                                    <dt className="font-semibold inline">Professor Links:</dt>{" "}
                                                    <dd className="inline">
                                                        {userPlan === 'free' ? (
                                                            renderLockedInfo('Professor Links')
                                                        ) : (
                                                            <a
                                                                href={program.professors}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Website
                                                            </a>
                                                        )}
                                                    </dd>
                                                </div>
                                            )}
                                            <div>
                                                <dt className="font-semibold inline">Funding:</dt>{" "}
                                                <dd className="inline">{program.funding || "N/A"}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-semibold inline">Amount:</dt>{" "}
                                                <dd className="inline">
                                                    {program.fundingAmount || "N/A"}
                                                </dd>
                                            </div>
                                            {/* Deadline (Conditional) */}
                                            <div>
                                                <dt className="font-semibold inline">Deadline:</dt>{" "}
                                                <dd className="inline">
                                                    {userPlan === 'free' 
                                                        ? renderLockedInfo('Deadline') 
                                                        : program.deadline || "N/A"
                                                    }
                                                </dd>
                                            </div>
                                            {/* GRE Waiver (Conditional) */}
                                            <div>
                                                <dt className="font-semibold inline">GRE Waiver:</dt>{" "}
                                                <dd className="inline">
                                                    {userPlan === 'free' 
                                                        ? renderLockedInfo('GRE Waiver Status')
                                                        : program.greWaiver || "N/A"
                                                    }
                                                </dd>
                                            </div>
                                            {/* App Fee Waiver (Conditional) */}
                                            <div>
                                                <dt className="font-semibold inline">App Fee Waiver:</dt>{" "}
                                                <dd className="inline">
                                                    {userPlan === 'free' 
                                                        ? renderLockedInfo('Application Fee Waiver Status')
                                                        : program.appFeeWaiver || "N/A"
                                                    }
                                                </dd>
                                            </div>
                                            {/* Required Docs (Conditional) */}
                                            <div>
                                                <dt className="font-semibold inline">Required Docs:</dt>{" "}
                                                <dd className="inline">
                                                    {userPlan === 'free' 
                                                        ? renderLockedInfo('Required Documents List')
                                                        : (Array.isArray(program.requiredDocs)
                                                            ? program.requiredDocs.join(", ") || "N/A"
                                                            : "N/A")
                                                    }
                                                </dd>
                                            </div>
                                        </dl>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => handleAddToInterested(program)}
                                            // Disabled if adding, already added, or LIMIT REACHED
                                            disabled={isAdding || program.alreadyAdded || isDisabledByLimit} 
                                            className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-full font-medium transition ${
                                                isAdding || isDisabledByLimit
                                                    ? "bg-gray-400 cursor-not-allowed text-white" // Show gray if adding or limit reached
                                                    : program.alreadyAdded
                                                        ? "bg-gray-300 cursor-not-allowed text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                                                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                                            }`}
                                        >
                                            {isAdding ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : program.alreadyAdded ? (
                                                "Added"
                                            ) : isDisabledByLimit ? (
                                                "Limit Reached" // New label when limit is hit
                                            ) : (
                                                <>
                                                    <FaPlus /> Add
                                                </>
                                            )}
                                        </button>

                                        {program.appLink && (
                                            <a
                                                href={program.appLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition"
                                            >
                                                Apply
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        // No results message
                        <p className="col-span-full text-center text-gray-500 text-lg py-10">
                            No programs found matching your criteria.
                        </p>
                    )}
                </div>

                {/* Instructional Text */}
                <div className="col-span-full text-center mt-12 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Can't find the program you're looking for? Click the <strong>Suggest Program</strong> button at the top to submit new programs for inclusion in the list.
                    </p>
                </div>
                {/* ---------------------------------- */}
            </div>


            {/* Pagination (Unchanged) */}
            {totalPages > 1 && !showSkeletons && (
                <div className="flex justify-center items-center gap-2 pb-8">
                    {/* Prev Button */}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || isFetching}
                        className={`px-3 py-2 rounded-md border flex items-center justify-center ${
                            currentPage === 1 || isFetching
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                    >
                        ‹
                    </button>

                    {/* Page Numbers (max 3 shown) */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                            if (totalPages <= 3) return true;
                            if (currentPage === 1) return page <= 3;
                            if (currentPage === totalPages) return page >= totalPages - 2;
                            return Math.abs(currentPage - page) <= 1;
                        })
                        .map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                disabled={isFetching}
                                className={`px-4 py-2 rounded-md border ${
                                    currentPage === page
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                    {/* Next Button */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages || isFetching}
                        className={`px-3 py-2 rounded-md border flex items-center justify-center ${
                            currentPage === totalPages || isFetching
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                    >
                        ›
                    </button>
                </div>
            )}

            {/* --- DISCLAIMER / WARNING BLOCK --- */}
            <div className="max-w-7xl mx-auto px-6 pt-0 pb-12">
                <div className="flex items-start gap-3 p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-inner">
                    <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                            Note:
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Our database team regularly vets and updates this information to ensure accuracy. However, you may still encounter occassional discrepancies. If you notice any, please do not hesitate to reach out to <strong className="text-blue-600">Grad Manager</strong> via the <Link to="/contact" aria-label="Contact">contact page</Link> so we can promptly correct them!
                        </p>
                    </div>
                </div>
            </div>
            {/* -------------------------------------- */}


          </>
        ) : (
          <ScholarshipCatalog />
        )}

{/* --- PROGRAM SUGGESTION MODAL --- */}
            {showSuggestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4 overflow-y-auto">
                    <SuggestProgramForm onClose={() => setShowSuggestionModal(false)} />
                </div>
            )}
            {/* -------------------------------------- */}
        </div>
    );
};

export default ProgramList;










