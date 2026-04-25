/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FaCloudUploadAlt,
  FaMagic,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaBolt,
  FaDollarSign,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { Application } from "../types/Application";

const API_PREDICT_URL = import.meta.env.VITE_API_PREDICT_URL;
// Assuming a URL to fetch the current user's full profile
const API_USER_PROFILE_URL = import.meta.env.VITE_API_URL + '/users/profile';
const SUBSCRIPTION_PAGE_ROUTE = "/subscribe"; 

// ⭐ CORRECTED: Client-side limits mirroring the backend for UI display ⭐
const PLAN_LIMITS = {
  free: 2,   // Correctly set to 2 checks for Free Plan
  pro: 15,
};

interface Props {
  applications: Application[];
}

// State Interface for User Data
interface UserPredictionData {
  predictionCount: number;
  currentPlan: 'free' | 'pro' | string; // Updated to include plan type
}

const AIPredictorForm: React.FC<Props> = ({ applications }) => {
  const { token } = useAuth();
  const [sopFile, setSopFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [school, setSchool] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // State for User Prediction Info - Default plan is 'free'
  const [userPredictionData, setUserPredictionData] = useState<UserPredictionData>({
    predictionCount: 0,
    currentPlan: 'free', 
  });

  // State to track if user data is initially loading
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  const isButtonActive = sopFile && transcriptFile && cvFile && school && department;
  
  // ⭐ FIX 1: Define the numeric calculation separately for safe comparison
  const maxChecks = PLAN_LIMITS[userPredictionData.currentPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
const isPro = userPredictionData.currentPlan === 'pro';

	const numericRemaining = maxChecks - userPredictionData.predictionCount;

	// Display "Unlimited" only when the plan truly has an infinite allowance
	const remainingPredictions = maxChecks === Infinity ? "Unlimited" : Math.max(0, numericRemaining);

	// Limit is reached when there are no remaining predictions (applies to all finite plans)
	const isLimitReached = numericRemaining <= 0;


  // Function to reset the prediction results state (New and Stable)
  const resetPredictionResult = useCallback(() => {
    setPrediction(null);
    setReasoning(null);
    setError(null);
    setStatusMessage(null);
  }, []);


  // Function to fetch user data (including prediction info)
  const fetchUserPredictionData = useCallback(async () => {
    if (!token) {
        setIsDataLoading(false);
        return;
    }
    
    // Only set loading to true if we are performing the initial load or a refetch after prediction
    if (userPredictionData.predictionCount === 0 || loading) setIsDataLoading(true); 

    try {
      const response = await axios.get(API_USER_PROFILE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = response.data;
      
      // Use subscription.plan and check status for active/inactive
      const userPlan = data.trialActive
        ? 'pro'
        : (data.subscription?.status === 'active' || data.subscription?.status === 'cancelled')
        ? data.subscription.plan
        : 'free';
      
      setUserPredictionData({
        predictionCount: data.predictionCount || 0,
        currentPlan: userPlan, // Use the determined plan
      });
      
    } catch (err) {
      console.error("Failed to fetch user prediction data:", err);
    } finally {
        setIsDataLoading(false); 
    }
  }, [token, userPredictionData.predictionCount, loading]);

  useEffect(() => {
    // 1. FETCH INITIAL DATA on mount/token change
    fetchUserPredictionData();
    
    // 2. APPLICATION/FORM LOGIC (only when selectedId changes)
    if (selectedApplicationId) {
      const selectedApp = applications.find((app) => app._id === selectedApplicationId);
      if (selectedApp) {
        setSchool(selectedApp.schoolName);
        setDepartment(selectedApp.programName);
      }
    } else {
      setSchool("");
      setDepartment("");
    }
  }, [selectedApplicationId, applications, token, fetchUserPredictionData]); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files && e.target.files.length > 0) {
      switch (fileType) {
        case "sop":
          setSopFile(e.target.files.item(0) || null);
          break;
        case "transcript":
          setTranscriptFile(e.target.files.item(0) || null);
          break;
        case "cv":
          setCvFile(e.target.files.item(0) || null);
          break;
      }
      // Reset prediction results when new files are uploaded
      resetPredictionResult(); 
    }
  };

  const handleApplicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedApplicationId(e.target.value);
    // Reset prediction results when application selection changes
    resetPredictionResult();
  };

  const handlePredict = async () => {
    if (isLimitReached) {
      setError(`Prediction limit reached for your ${userPredictionData.currentPlan.toUpperCase()} plan (${maxChecks} checks). Please subscribe to continue using the AI predictor.`);
      return;
    }

    if (!sopFile || !transcriptFile || !cvFile || !school || !department) {
      setError("Please upload all required documents and select an application.");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);
    setReasoning(null);
    setStatusMessage("Analyzing your documents with our AI model...");

    const formData = new FormData();
    formData.append("sop", sopFile);
    formData.append("transcript", transcriptFile);
    formData.append("cv", cvFile);
    formData.append("school", school);
    formData.append("department", department);

    try {
      const response = await axios.post(`${API_PREDICT_URL}/predict`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-form-data",
        },
      });
      const { score, reasoning } = response.data;
      setPrediction(score);
      setReasoning(reasoning);
      setStatusMessage("Prediction complete!");
      
      // Introduce a small, defensive delay (500ms) 
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // AWAIT the refetch for better serialization
      await fetchUserPredictionData();

    } catch (err) {
      console.error("Prediction failed:", err);

      // Handle limit exceeded error (from frontend check or backend 403)
      if (axios.isAxiosError(err) && (isLimitReached || (err.response?.status === 403 && err.response?.data?.limitExceeded))) { 
        setError(err.response?.data?.error || `Prediction limit reached. Please check your subscription or try again tomorrow.`); 
        await fetchUserPredictionData();
      } else {
        setError("Prediction failed. Please try again.");
      }
      
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPredictionCategory = (score: number) => {
    if (score >= 80) return "High Chance";
    if (score >= 50) return "Good Chance";
    return "Room for Improvement";
  };

  const getFileStatus = (file: File | null) =>
    file ? <FaCheckCircle className="text-green-500 ml-2" /> : <FaExclamationCircle className="text-gray-400 ml-2" />;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-secondary flex items-center gap-3">
          <FaMagic className="text-primary text-2xl sm:text-3xl" />
          <span>
            <strong>AI Application Predictor</strong>
          </span>
                </h1>
        <span className="text-sm text-neutral-500 italic">Powered by advanced AI</span>
      </div>
      
      {/* **IMPORTANT:** The old hardcoded "Free Tier: 7 predictions left" banner must be removed here. 
          The dynamic banner below correctly uses the '2' limit. 
          If you see the old banner, delete it from your JSX. 
      */}

      {/* ⭐ Dynamic Prediction Count / Subscription Status Banner (KEEP) ⭐ */}
      <div className={`mb-8 p-4 rounded-xl shadow-md ${maxChecks === Infinity || isPro ? 'bg-indigo-50 border-indigo-200' : 'bg-yellow-50 border-yellow-200'} border flex flex-col sm:flex-row justify-between items-center`}>
        <div className="flex items-center text-lg font-semibold text-gray-800">
          <FaBolt className={`mr-2 ${maxChecks === Infinity || isPro ? 'text-indigo-600' : 'text-yellow-600'}`} />
          
            {/* Conditional display based on loading state */}
            {isDataLoading ? (
                 <span>
                     <FaSpinner className="animate-spin mr-2" /> Loading Usage Data...
                 </span>
            ) : (
              <span>
                <span className="capitalize">{userPredictionData.currentPlan}</span> Subscription Active:&nbsp;
                <strong className={maxChecks === Infinity ? 'text-indigo-700' : (isLimitReached ? 'text-red-600' : 'text-yellow-700')}>
                  {maxChecks === Infinity
                    ? 'Unlimited Predictions'
                    : `${remainingPredictions} prediction${remainingPredictions !== 1 ? 's' : ''} left (Max: ${maxChecks})`}
                </strong>
              </span>
            )}
        </div>
        
        {/* Subscribe Button */}
{maxChecks !== Infinity && !isDataLoading && (
  <motion.button
    onClick={() => window.location.href = SUBSCRIPTION_PAGE_ROUTE}
    className="mt-3 sm:mt-0 py-2 px-4 bg-primary text-white font-medium rounded-full 
               transition-colors shadow-md flex items-center hover:bg-primary-dark"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    disabled={false}
  >
    <FaDollarSign className="mr-2" /> Upgrade Now
  </motion.button>
)}
      </div>
      
      {/* Intro */}
      <p className="text-neutral-700 mb-8 text-center leading-relaxed text-base sm:text-lg">
        Upload your <strong>Statement of Purpose (SOP)</strong>, <strong>Transcript</strong>, and{" "}
        <strong>Curriculum Vitae (CV)</strong> to receive an <em className="text-primary font-semibold">AI-driven prediction</em> on your application's potential.
      </p>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Select application */}
        <div>
          <label htmlFor="application-select" className="block text-sm font-semibold text-gray-800 mb-2">
            Select an Application
          </label>
          <select
            id="application-select"
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none text-black"
            value={selectedApplicationId}
            onChange={handleApplicationChange}
          >
            <option value="">-- Choose from your applications --</option>
            {applications.map((app) => (
              <option key={app._id} value={app._id}>
                {app.schoolName} - {app.programName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="school-input" className="block text-sm font-semibold text-gray-800 mb-2">
            School/Scholarship Name
          </label>
          <input
            id="school-input"
            type="text"
            className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 cursor-not-allowed text-gray-700"
            value={school}
            readOnly
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="department-input" className="block text-sm font-semibold text-gray-800 mb-2">
            Program Name
          </label>
          <input
            id="department-input"
            type="text"
            className="w-full p-3 rounded-xl border border-gray-300 bg-gray-100 cursor-not-allowed text-gray-700"
            value={department}
            readOnly
          />
        </div>
      </div>

      {/* Uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { id: "sop-upload", label: "Upload SOP/Essay", file: sopFile, type: "sop" },
          { id: "transcript-upload", label: "Upload Transcript", file: transcriptFile, type: "transcript" },
          { id: "cv-upload", label: "Upload CV", file: cvFile, type: "cv" },
        ].map(({ id, label, file, type }) => (
          <React.Fragment key={id}>
            <motion.label
              htmlFor={id}
              className={`flex-grow w-full p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl cursor-pointer hover:from-neutral-100 hover:to-neutral-200 transition-all border-2 ${
                file ? "border-green-400" : "border-transparent"
              } flex items-center justify-between`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-black flex items-center font-medium">
                <FaCloudUploadAlt className="mr-2 text-primary" /> {label}
                {getFileStatus(file)}
              </span>
              <span className="text-xs text-neutral-500 text-right truncate max-w-[50%]">
                {file ? file.name : "No file selected"}
              </span>
            </motion.label>
            <input
              id={id}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFileChange(e, type)}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="text-red-600 mt-4 text-center p-3 border border-red-200 bg-red-50 rounded-lg text-sm font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predict Button */}
      <div className="mt-8 text-center">
        <motion.button
          onClick={handlePredict}
          // Button is disabled if files are missing OR loading OR limit is reached
          disabled={!isButtonActive || loading || isLimitReached}
          className={`bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-10 rounded-full shadow-lg transition-all text-lg flex items-center justify-center mx-auto ${
            isButtonActive && !loading && !isLimitReached
              ? "hover:shadow-xl hover:scale-105"
              : "opacity-50 cursor-not-allowed"
          }`}
          whileTap={isButtonActive && !loading && !isLimitReached ? { scale: 0.95 } : {}}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Predicting...
            </>
          ) : isLimitReached ? (
            "Limit Reached"
          ) : (
            "Get Prediction Score"
          )}
        </motion.button>
        <p className="text-sm mt-3 text-neutral-500">
          <em>The button activates when all files are uploaded and an application is selected.</em>
        </p>
      </div>

      {/* Status */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            className="mt-4 text-center text-sm text-neutral-600 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prediction Result */}
      <AnimatePresence>
        {prediction !== null && (
          <motion.div
            className="mt-12 pt-10 border-t border-neutral-200 text-center relative" // Added relative for close button positioning
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {/* NEW CLOSE BUTTON */}
            <button
              onClick={resetPredictionResult} // Allows user to manually close
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-800 transition rounded-full hover:bg-neutral-100"
              title="Close results"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="text-xl font-bold text-primaryDark">Your AI-Predicted Score:</p>
            <motion.div
              className="mt-6 inline-block p-10 rounded-full relative overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <div className="absolute inset-0 rounded-full bg-white border-4 border-gray-100 shadow-inner"></div>
              <span className={`relative text-6xl sm:text-7xl font-extrabold ${getPredictionColor(prediction)}`}>
                {prediction.toFixed(0)}%
              </span>
              <p className={`mt-3 text-lg sm:text-xl font-semibold relative ${getPredictionColor(prediction)}`}>
                {getPredictionCategory(prediction)}
              </p>
            </motion.div>

            {reasoning && (
              <motion.div
                className="mt-8 p-6 rounded-2xl border border-blue-200 bg-blue-50 text-left max-w-3xl mx-auto shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <FaMagic className="mr-2 text-primary" /> <strong>AI Reasoning & Feedback</strong>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{reasoning}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPredictorForm;

