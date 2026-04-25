/* eslint-disable no-irregular-whitespace */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/AdminDashboard/AdminProjectReview.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEdit, FaTrashAlt, FaUserSlash, FaUserPlus, FaUserMinus } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface Project {
    id: string;
    title: string;
    description: string;
    goals: string;
    creatorName: string;
    creatorId: string;
    status: 'pending_approval' | 'active' | 'declined';
    createdAt: string;
    members: string[];
    pendingRequests: { userId: string, userName: string, requestedAt: string }[];
}

interface User {
    uid: string;
    firstName: string;
    lastName: string;
}

const AdminProjectReview: React.FC = () => {
    const { token } = useAuth();
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectMembers, setProjectMembers] = useState<Record<string, User>>({});

    const fetchAllProjects = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get<Project[]>(`${API_URL}/projects/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllProjects(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching all projects:', err);
            setError('Failed to fetch projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectMembers = async (memberIds: string[]) => {
        if (!token || memberIds.length === 0) return {};
        try {
            const usersResponse = await axios.post<User[]>(`${API_URL}/users/get-by-ids`, { uids: memberIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const usersMap = usersResponse.data.reduce((acc, user) => {
                acc[user.uid] = user;
                return acc;
            }, {} as Record<string, User>); 
            setProjectMembers(prev => ({ ...prev, ...usersMap }));
        } catch (err) {
            console.error('Error fetching project members:', err);
        }
    };

    useEffect(() => {
        fetchAllProjects();
    }, [token]);

    useEffect(() => {
        const memberIds = allProjects.flatMap(project => project.members);
        if (memberIds.length > 0) {
            fetchProjectMembers(memberIds);
        }
    }, [allProjects]);

    const handleProjectAction = async (projectId: string, action: 'approve' | 'decline' | 'delete') => {
        if (!token) return;
        setLoading(true);
        try {
            if (action === 'delete') {
                await axios.delete(`${API_URL}/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`${API_URL}/projects/${projectId}/${action}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchAllProjects();
        } catch (err) {
            console.error(`Error ${action} project:`, err);
            setError(`Failed to ${action} project.`);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (projectId: string, userId: string, action: 'accept' | 'decline') => {
        if (!token) return;
        setLoading(true);
        try {
        const endpoint = `${API_URL}/projects/${projectId}/join-requests/${action === 'accept' ? 'approve' : 'decline'}`;
        await axios.put(endpoint, { userId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
            fetchAllProjects();
        } catch (err) {
            console.error(`Error ${action}ing request:`, err);
            setError(`Failed to ${action} request.`);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (projectId: string, memberId: string) => {
        if (!token) return;
        setLoading(true);
        try {
            const endpoint = `${API_URL}/projects/${projectId}/remove-member`;
            await axios.put(endpoint, { memberId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllProjects();
        } catch (err) {
            console.error('Error removing member:', err);
            setError('Failed to remove member.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject || !token) return;
        setLoading(true);
        try {
            await axios.put(`${API_URL}/projects/${editingProject.id}`, {
                title: editingProject.title,
                goals: editingProject.goals,
                description: editingProject.description,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingProject(null);
            fetchAllProjects();
        } catch (err) {
            console.error('Error updating project:', err);
            setError('Failed to update project.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500 flex items-center justify-center"><FaSpinner className="animate-spin mr-2" /> Loading all projects...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage All Projects</h2>

            {editingProject && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold mb-4">Edit Project</h3>
                    <form onSubmit={handleUpdateProject}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={editingProject.title}
                                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="goals">Goals</label>
                            <textarea
                                id="goals"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={editingProject.goals}
                                onChange={(e) => setEditingProject({ ...editingProject, goals: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={editingProject.description}
                                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                            >
                                Update Project
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingProject(null)}
                                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {allProjects.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p className="text-lg">No projects found. 🤷‍♂️</p>
                    </div>
                ) : (
                    allProjects.map((project) => (
                        <div key={project.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                                    project.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Created by: {project.creatorName}</p>
                            <p className="text-gray-700 mt-4 text-sm">{project.description}</p>

                            {project.status === 'active' && project.members.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold text-gray-800">Members:</h4>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                        {project.members.map(memberId => (
                                            <li key={memberId} className="flex items-center justify-between">
                                                <span>{projectMembers[memberId]?.firstName} {projectMembers[memberId]?.lastName}</span>
                                                <button
                                                    onClick={() => handleRemoveMember(project.id, memberId)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Remove member"
                                                >
                                                    <FaUserSlash />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {project.pendingRequests.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold text-gray-800">Pending Requests:</h4>
                                    <ul className="list-disc list-inside mt-2 space-y-2 text-sm">
                                        {project.pendingRequests.map(request => (
                                            <li key={request.userId} className="flex items-center justify-between">
                                                <span>{request.userName}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRequestAction(project.id, request.userId, 'accept')}
                                                            className="text-green-500 hover:text-green-700 transition-colors"
                                                            title="Accept request">
                                                        <FaUserPlus />
                                                    </button>
                                                    <button onClick={() => handleRequestAction(project.id, request.userId, 'decline')}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Decline request">
                                                        <FaUserMinus />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-2">
                                <button onClick={() => handleEditProject(project)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center text-sm">
                                    <FaEdit className="mr-2" /> Edit
                                </button>
                                <button onClick={() => handleProjectAction(project.id, 'delete')} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center text-sm">
                                    <FaTrashAlt className="mr-2" /> Delete
                                </button>
                                {project.status === 'pending_approval' && (
                                    <>
                                        <button onClick={() => handleProjectAction(project.id, 'approve')} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center text-sm">
                                            <FaCheckCircle className="mr-2" /> Approve
                                        </button>
                                        <button onClick={() => handleProjectAction(project.id, 'decline')} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center text-sm">
                                            <FaTimesCircle className="mr-2" /> Decline
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminProjectReview;