/* eslint-disable no-irregular-whitespace */
// frontend/src/components/Dashboard/ProjectsCard.tsx

import React from "react";
import { FaUsers, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// 1. Remove the ProjectsCardProps interface as it's no longer needed
// export interface ProjectsCardProps {
//   onOpenProjects: () => void; // <-- The missing prop from the Dashboard component
// }

// 2. Update the component signature to remove the prop
const ProjectsCard: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  
  // Define the navigation handler
  const handleNavigateToProjects = () => {
    navigate("/projects"); // Navigate to the new page path
  };

  const cardClass =
    "bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 " +
    "bg-[length:200%_200%] animate-gradient-shift text-white " +
    "backdrop-blur-xl rounded-2xl shadow-card-lg p-6 sm:p-8 mt-6 " +
    "flex flex-col sm:flex-row justify-between items-center " +
    "transition-all duration-500 hover:scale-[1.02]";

  const buttonClass =
    "bg-white text-indigo-600 font-semibold py-2 px-6 sm:py-3 sm:px-8 " +
    "rounded-full shadow-md hover:bg-gray-100 hover:text-indigo-700 " +
    "transform hover:scale-105 transition-all duration-300 " +
    "flex items-center space-x-2 w-full sm:w-auto";

  const headerClass =
    "text-lg sm:text-xl font-extrabold tracking-tight flex items-center";

  const subTextClass =
    "text-white/90 mt-2 text-sm sm:text-base leading-relaxed";

  return (
    <div className={cardClass}>
      {/* Left Section */}
      <div className="max-w-lg text-center sm:text-left mb-4 sm:mb-0">
        <h3 className={headerClass}>
          <FaUsers className="mr-2 text-white text-xl sm:text-2xl" />
          Join Ongoing Projects
        </h3>
        <p className={subTextClass}>
          Collaborate with{" "}
          <span className="font-semibold">fellow applicants</span> on{" "}
          <span className="font-semibold">team-based projects</span> to
          strengthen your skills and expand your network.
        </p>
      </div>

      {/* Right Section: Button */}
      {/* 3. Use the new navigation handler directly */}
      <button onClick={handleNavigateToProjects} className={buttonClass}> 
        <span className="tracking-wide">Explore Projects</span>
        <FaPlus className="text-sm" />
      </button>
    </div>
  );
};

export default ProjectsCard;