/* eslint-disable no-irregular-whitespace */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Interface for a Group object
export interface Group {
  id: string;
  name: string;
}

/**
 * Fetches the groups the current user is a member of.
 * @param token The user's authentication token.
 * @returns A promise that resolves to an array of Group objects.
 */
export const fetchMyGroups = async (userId: string, token: string): Promise<Group[]> => {
  try {
    // The API endpoint should likely be specific to the user, like /groups/my/userId
    // The original call in Dashboard.tsx was fetchMyGroups(currentUser.uid, token), which fits this signature.
    const response = await axios.get(`${API_URL}/groups/my/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Assuming the backend returns the groups as an array in a 'groups' key
    return response.data.groups;
  } catch (error) {
    console.error('Error fetching user\'s groups:', error);
    throw error;
  }
};


/**
 * Fetches all public groups and any pending join requests from the user.
 * @param token The user's authentication token.
 * @returns A promise that resolves to an object containing all groups and sent request IDs.
 */
export const fetchAllGroups = async (token: string): Promise<{ groups: Group[], sentRequests: string[] }> => {
  try {
    const response = await axios.get(`${API_URL}/groups/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all groups:', error);
    throw error;
  }
};

/**
 * Sends a request to join a specific group.
 * @param groupId The ID of the group to join.
 * @param token The user's authentication token.
 * @returns A promise that resolves with a success message.
 */
export const joinGroup = async (groupId: string, token: string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/groups/${groupId}/join`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

/**
 * Creates a new group with specified members.
 * @param groupName The name of the new group.
 * @param memberIds An array of user IDs to include in the group.
 * @param token The user's authentication token.
 * @returns A promise that resolves with the ID of the new group.
 */
export const createGroup = async (groupName: string, memberIds: string[], token: string): Promise<{ groupId: string; message: string }> => {
  try {
    const response = await axios.post(
      `${API_URL}/groups/create`,
      { groupName, memberIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};