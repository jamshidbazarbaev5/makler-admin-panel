import { createResourceApiHooks } from '../helpers/createResourceApi'
import api from './api'

// Types
export interface User {
  id: number;
  telegram_id: number;
  username: string;
  full_name: string;
  phone: string | null;
  avatar: string | null;
  is_agent: boolean;
  is_active: boolean;
  preferred_language: string;
  bio: string;
  properties_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// API endpoints
const USERS_URL = 'users/';

// Create users API hooks using the factory function
export const {
  useGetResources: useGetUsers,
  useGetResource: useGetUser,
  useCreateResource: useCreateUser,
  useUpdateResource: useUpdateUser,
  useDeleteResource: useDeleteUser,
} = createResourceApiHooks<User>(USERS_URL, 'users');

// Function to fetch users with pagination
export const fetchUsersWithPagination = async (page: number = 1, searchTerm?: string): Promise<UsersResponse> => {
  const params: any = { page };
  if (searchTerm) {
    params.search = searchTerm;
  }
  const response = await api.get<UsersResponse>(USERS_URL, { params });
  return response.data;
};

// Function to fetch all users across all pages
export const fetchAllUsers = async (): Promise<User[]> => {
  let allUsers: User[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await api.get<UsersResponse>(USERS_URL, {
        params: { page: currentPage }
      });

      allUsers = [...allUsers, ...response.data.results];

      // Check if there's a next page
      hasMorePages = response.data.next !== null;
      currentPage++;
    } catch (error) {
      console.error('Error fetching users page:', currentPage, error);
      hasMorePages = false;
    }
  }

  return allUsers;
};

// Function to fetch single user by ID
export const fetchUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`${USERS_URL}${id}/`);
  return response.data;
};

// Function to toggle user active status
export const toggleUserActive = async (id: number): Promise<User> => {
  const response = await api.post<User>(`${USERS_URL}${id}/toggle_active/`);
  return response.data;
};
