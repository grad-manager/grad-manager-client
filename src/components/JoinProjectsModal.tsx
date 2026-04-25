import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaSpinner, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';
import ConfirmationModal from './common/ConfirmationModal';

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
  id: string;
  title: string;
  goals: string;
  description: string;
  creatorName: string;
  members: string[];
  pendingRequests: string[];
}

interface JoinProjectsModalProps {
  onClose: () => void;
}

const JoinProjectsModal: React.FC<JoinProjectsModalProps> = ({ onClose }) => {
  const { currentUser, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', goals: '', description: '' });
  const [joinStatus, setJoinStatus] = useState<Record<string, 'requested' | 'member' | 'none'>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

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
      const fetchedProjects = response.data;
      setProjects(fetchedProjects);

      // Build joinStatus mapping
      const initialStatus = fetchedProjects.reduce((acc: Record<string, 'requested' | 'member' | 'none'>, project: Project) => {
        const isUserMember = project.members.includes(currentUser?.uid as string);
        const isUserRequested = project.pendingRequests.includes(currentUser?.uid as string);
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
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentUser]);

  // Request to join
  const handleJoinRequest = async (projectId: string) => {
    if (!token || joinStatus[projectId] !== 'none') return;

    setJoinStatus(prev => ({ ...prev, [projectId]: 'requested' }));
    try {
      await axios.post(`${API_URL}/projects/${projectId}/join-request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(<SuccessToast message="Join request sent successfully! An admin will review it." />);
    } catch (error) {
      console.error('Error sending join request:', error);
      setJoinStatus(prev => ({ ...prev, [projectId]: 'none' }));
      toast.error(<ErrorToast message="Failed to send join request. Please try again." />);
    }
  };

  // Create project
  const handleCreateProject = async () => {
    if (!token) return;

    setIsConfirmModalOpen(false);
    setSubmitLoading(true);

    try {
      await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(<SuccessToast message="Project submitted for admin approval!" />);
      setNewProject({ title: '', goals: '', description: '' });
      setIsCreatingProject(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(<ErrorToast message="Failed to create project. Please try again." />);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEnterProject = (projectId: string) => {
    navigate(`/project-room/${projectId}`);
    onClose();
  };

  // Button based on status
  const getButton = (projectId: string) => {
    const status = joinStatus[projectId];
    const baseClass =
      'font-semibold py-2 px-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2';

    if (status === 'member') {
      return (
        <button
          onClick={() => handleEnterProject(projectId)}
          className={`${baseClass} bg-primary text-white hover:bg-indigo-700 transform hover:scale-105`}
        >
          <FaSignInAlt />
          <span>Enter Room</span>
        </button>
      );
    } else if (status === 'requested') {
      return (
        <button className={`${baseClass} bg-neutral-400 text-white cursor-not-allowed`} disabled>
          <FaSpinner className="animate-spin" />
          <span>Requested</span>
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleJoinRequest(projectId)}
          className={`${baseClass} bg-primary text-white hover:bg-indigo-700 transform hover:scale-105`}
        >
          <FaPlus />
          <span>Join</span>
        </button>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-neutral-200 flex-shrink-0">
        <h2 className="text-2xl font-bold text-secondary">Ongoing Projects</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Create Project Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreatingProject(!isCreatingProject)}
            className="bg-primary text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <FaPlus />
            <span>{isCreatingProject ? 'Cancel' : 'Create New Project'}</span>
          </button>
        </div>

        {/* Create Project Form */}
        {isCreatingProject && (
          <div className="bg-neutral-light p-6 rounded-xl animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">Propose a New Project</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsConfirmModalOpen(true);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-dark mb-1">Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1">Goals</label>
                <textarea
                  value={newProject.goals}
                  onChange={(e) => setNewProject({ ...newProject, goals: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-20"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white font-semibold py-2 px-6 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                disabled={submitLoading}
              >
                {submitLoading ? <FaSpinner className="animate-spin" /> : 'Submit for Approval'}
              </button>
            </form>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="text-center p-8">
            <FaSpinner className="animate-spin mx-auto text-primary text-4xl" />
            <p className="mt-4 text-neutral-dark">Loading projects...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-center text-neutral-dark italic p-8">
                No active projects available. Be the first to create one!
              </p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-neutral-light p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <h3 className="text-xl font-bold text-secondary">{project.title}</h3>
                    <p className="text-secondary mt-1 text-sm">Created by: {project.creatorName}</p>
                    <p className="text-secondary mt-2">
                      <span className="font-semibold">Goals:</span> {project.goals}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">{getButton(project.id)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleCreateProject}
        title="Confirm Project Creation"
        message="Are you sure you want to submit this project for review? An admin will be notified."
        confirmButtonText="Submit"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default JoinProjectsModal;
