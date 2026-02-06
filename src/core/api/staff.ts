import { createResourceApiHooks } from '../helpers/createResourceApi'
import api from './api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Staff {
  id?: number;
  username: string;
  full_name: string;
  role: 'admin' | 'moderator';
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface StaffCreate {
  username: string;
  full_name: string;
  role: 'admin' | 'moderator';
  password: string;
  is_active?: boolean;
}

export interface StaffUpdate {
  username?: string;
  full_name?: string;
  role?: 'admin' | 'moderator';
  is_active?: boolean;
}

export interface ChangePasswordPayload {
  new_password: string;
}

export interface StaffResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Staff[];
}

// API endpoints
const STAFF_URL = 'staff/';

// Create staff API hooks using the factory function
export const {
  useGetResources: useGetStaff,
  useGetResource: useGetStaffMember,
  useCreateResource: useCreateStaff,
  useDeleteResource: useDeleteStaff,
} = createResourceApiHooks<Staff>(STAFF_URL, 'staff');

// Custom PATCH update hook for staff (API requires PATCH, not PUT)
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StaffUpdate }) => {
      const response = await api.patch<Staff>(`${STAFF_URL}${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

// Change staff password (admin changing another user's password)
export const changeStaffPassword = async (staffId: number, newPassword: string): Promise<void> => {
  await api.post(`${STAFF_URL}${staffId}/change-password/`, { new_password: newPassword });
};

// Change own password (current user changing their own password)
export const changeOwnPassword = async (newPassword: string): Promise<void> => {
  await api.post(`${STAFF_URL}me/change-password/`, { new_password: newPassword });
};

// Toggle staff active status
export const toggleStaffActive = async (staffId: number): Promise<Staff> => {
  const response = await api.post<Staff>(`${STAFF_URL}${staffId}/toggle_active/`, {});
  return response.data;
};

// Hook for changing staff password
export const useChangeStaffPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, newPassword }: { staffId: number; newPassword: string }) =>
      changeStaffPassword(staffId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

// Hook for changing own password
export const useChangeOwnPassword = () => {
  return useMutation({
    mutationFn: (newPassword: string) => changeOwnPassword(newPassword),
  });
};

// Hook for toggling staff active status
export const useToggleStaffActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: number) => toggleStaffActive(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

// Function to fetch staff with pagination
export const fetchStaffWithPagination = async (page: number = 1, searchTerm?: string): Promise<StaffResponse> => {
  const params: Record<string, unknown> = { page };
  if (searchTerm) {
    params.search = searchTerm;
  }
  const response = await api.get<StaffResponse>(STAFF_URL, { params });
  return response.data;
};

// Function to fetch all staff across all pages
export const fetchAllStaff = async (): Promise<Staff[]> => {
  let allStaff: Staff[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await api.get<StaffResponse>(STAFF_URL, {
        params: { page: currentPage }
      });

      allStaff = [...allStaff, ...response.data.results];

      // Check if there's a next page
      hasMorePages = response.data.next !== null;
      currentPage++;
    } catch (error) {
      console.error('Error fetching staff page:', currentPage, error);
      hasMorePages = false;
    }
  }

  return allStaff;
};

// Function to fetch single staff member by ID
export const fetchStaffById = async (id: number): Promise<Staff> => {
  const response = await api.get<Staff>(`${STAFF_URL}${id}/`);
  return response.data;
};
