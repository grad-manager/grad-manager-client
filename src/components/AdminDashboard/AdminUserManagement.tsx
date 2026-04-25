/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/AdminDashboard/AdminUserManagement.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// --- User Interface ---
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'mentor' | 'admin';
  createdAt: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  countries?: string[];
  isEmailVerified: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

// --- Edit User Modal Component ---
interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  token: string | null;
  isAdminBeingEdited: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  token,
  isAdminBeingEdited,
}) => {
  const [formData, setFormData] = useState<Partial<User>>(user);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    setFormData(user);
    setModalError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!token) return setModalError('Authentication token missing.');
    setIsSaving(true);
    setModalError('');

    const updatePayload: Partial<User> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
    };

    if (!isAdminBeingEdited) {
      updatePayload.role = formData.role;
    } else if (formData.role && formData.role !== user.role) {
      setIsSaving(false);
      return setModalError('Cannot change the role of an existing Administrator.');
    }

    try {
      const response = await axios.put(`${API_URL}/admin/users/${user.id}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User details updated successfully!');
      onSave(response.data);
      onClose();
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user.');
      setModalError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-2xl font-bold text-indigo-700">
                Edit User: {user.firstName} {user.lastName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition duration-150"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Form Fields */}
            {['firstName', 'lastName', 'email'].map((field) => (
              <label key={field} className="block mb-3">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {field.replace('Name', ' Name')}
                </span>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field as keyof User]?.toString() || ''}
                  onChange={handleChange}
                  readOnly={field === 'email'}
                  disabled={field === 'email'}
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm 
                    ${
                      field === 'email'
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                />
              </label>
            ))}

            {/* Gender */}
            <label className="block mb-3">
              <span className="text-sm font-medium text-gray-700">Gender</span>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>

            {/* Verification */}
            <div className="block pt-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Email Verification Status</span>
              <div
                className={`mt-1 p-3 rounded-lg font-medium text-sm flex items-center shadow-inner ${
                  user.isEmailVerified
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {user.isEmailVerified ? (
                  <span className="flex items-center">
                    <FaCheckCircle className="mr-2" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaExclamationCircle className="mr-2" /> Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Role */}
            <label className="block mb-5">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <select
                name="role"
                value={formData.role || 'user'}
                onChange={handleChange}
                disabled={isAdminBeingEdited}
                className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  isAdminBeingEdited ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                }`}
              >
                <option value="user">User</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>
              {isAdminBeingEdited && (
                <p className="text-yellow-600 text-xs mt-1">
                  Role change restricted for existing administrators.
                </p>
              )}
            </label>

            {modalError && (
              <p className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                {modalError}
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end pt-5 border-t mt-5">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="mr-3 px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main AdminUserManagement Component ---
const AdminUserManagement: React.FC = () => {
  const { token, currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'firstName' | 'email' | 'role'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>(
    'all'
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- CSV EXPORT FUNCTION ---
  const downloadCSV = () => {
    const header = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Role',
      'Gender',
      'Email Verified',
      'Created At',
    ];

    const rows = finalDisplayUsers.map((u) => [
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.role,
      u.gender || 'N/A',
      u.isEmailVerified ? 'Verified' : 'Unverified',
      new Date(u.createdAt).toLocaleString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map((row) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `user_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!token || !userProfile || userProfile.role !== 'admin') {
      setLoading(false);
      setError('Access Denied: Admin authentication required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  }, [token, userProfile]);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchUsers]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleUserSave = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    handleCloseModal();
  };

  const handleDelete = async (userId: string) => {
    if (!token) return;
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete && userToDelete.role === 'admin')
      return toast.error('Admin accounts cannot be deleted.');

    if (!window.confirm(`Delete ${userToDelete?.email}? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== userId));
      toast.success('User deleted successfully!');
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  // Sorting
  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else setSortBy(key);
    setCurrentPage(1);
  };

  const finalDisplayUsers = useMemo(() => {
    const roleOrder: Record<User['role'], number> = {
      admin: 0,
      mentor: 1,
      user: 2,
    };
    const filtered = users.filter((u) => {
      const matchesSearch =
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesVerification = true;
      if (verificationFilter === 'verified') matchesVerification = u.isEmailVerified;
      else if (verificationFilter === 'unverified') matchesVerification = !u.isEmailVerified;
      return matchesSearch && matchesVerification;
    });

    const sorted = filtered.sort((a, b) => {
      if (sortBy === 'role') {
        const comparison = roleOrder[a.role] - roleOrder[b.role];
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      return 0;
    });

    return sorted;
  }, [users, searchTerm, verificationFilter, sortBy, sortOrder]);

  // Pagination
  const totalUsers = finalDisplayUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = finalDisplayUsers.slice(startIndex, startIndex + usersPerPage);

  const renderSortIcon = (key: typeof sortBy) => {
    if (sortBy !== key) return null;
    return sortOrder === 'asc' ? <FaSortAlphaUp className="ml-1" /> : <FaSortAlphaDown className="ml-1" />;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading && users.length === 0)
    return <div className="text-center p-10 text-xl text-gray-600 font-medium">Loading user data...</div>;

  if (userProfile && userProfile.role !== 'admin')
    return (
      <div className="text-center p-10 text-2xl text-red-600 font-bold bg-red-50 border border-red-200 rounded-xl m-4">
        🚫 Access Denied: You must have the Admin role.
      </div>
    );

  if (error)
    return (
      <div className="text-center p-10 text-red-500 bg-red-50 border border-red-200 rounded-xl m-4">
        🚨 Error: {error}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        Admin User Management 👥
      </h2>

      {/* EXPORT BUTTON + BROADCAST */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Total users: <span className="font-semibold">{totalUsers}</span>
          </div>
          <button
            onClick={() => navigate('/admin/broadcast-email')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition flex items-center"
          >
            📣 Send Broadcast
          </button>
        </div>

        <div>
          <button
            onClick={downloadCSV}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition flex items-center"
          >
            📥 Download Spreadsheet (CSV)
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="flex items-center w-full border border-gray-300 rounded-xl bg-white shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition">
            <FaSearch className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <label className="block">
          <span className="text-xs font-medium text-gray-600 mb-1 block">Verification Status</span>
          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="p-3 w-full border border-gray-300 rounded-xl bg-white text-gray-700 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Emails</option>
            <option value="unverified">Unverified Emails</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600 mb-1 block">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy);
              setCurrentPage(1);
            }}
            className="p-3 w-full border border-gray-300 rounded-xl bg-white text-gray-700 focus:ring-indigo-500 text-sm"
          >
            <option value="firstName">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600 mb-1 block">Sort Order</span>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as typeof sortOrder);
              setCurrentPage(1);
            }}
            className="p-3 w-full border border-gray-300 rounded-xl bg-white text-gray-700 focus:ring-indigo-500 text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600 mb-1 block">Users Per Page</span>
          <select
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-3 w-full border border-gray-300 rounded-xl bg-white text-gray-700 focus:ring-indigo-500 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-gray-600 mb-4 font-medium">
        Displaying {paginatedUsers.length} users on this page (Total: {totalUsers}). Page {currentPage} of {totalPages}.
      </p>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'firstName', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as typeof sortBy)}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    {label} {renderSortIcon(key as typeof sortBy)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Verified</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Gender</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="hover:bg-indigo-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 inline-flex text-xs font-bold rounded-full uppercase ${
                      u.role === 'admin'
                        ? 'bg-indigo-500 text-white'
                        : u.role === 'mentor'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {u.isEmailVerified ? (
                    <FaCheckCircle className="text-green-500 text-lg" />
                  ) : (
                    <FaExclamationCircle className="text-red-500 text-lg" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.gender || 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleEdit(u)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3 p-2 rounded-full hover:bg-indigo-100"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100"
                  >
                    <FaTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedUsers.length === 0 && (
          <div className="text-center p-8 text-gray-500 font-medium">
            No users found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalUsers > usersPerPage && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-200 space-y-3 sm:space-y-0">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Showing <span className="font-semibold">{startIndex + 1}</span>–{' '}
            <span className="font-semibold">{Math.min(startIndex + usersPerPage, totalUsers)}</span> of{' '}
            <span className="font-semibold">{totalUsers}</span> results
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleUserSave}
          token={token}
          isAdminBeingEdited={editingUser.role === 'admin'}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;
