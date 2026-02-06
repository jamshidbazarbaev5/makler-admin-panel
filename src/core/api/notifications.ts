import { createResourceApiHooks } from '../helpers/createResourceApi'
import api from './api'

// Types
export interface Notification {
  id: number;
  user: number;
  user_name: string;
  notification_type: string;
  title: string;
  message: string;
  announcement: string | null;
  is_read: boolean;
  read_at: string | null;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface NotificationStats {
  total: number;
  unread: number;
  unsent: number;
  by_type: {
    [key: string]: number;
  };
}

// API endpoints
const NOTIFICATIONS_URL = 'notifications/';

// Create notifications API hooks using the factory function
export const {
  useGetResources: useGetNotifications,
  useGetResource: useGetNotification,
  useCreateResource: useCreateNotification,
  useUpdateResource: useUpdateNotification,
  useDeleteResource: useDeleteNotification,
} = createResourceApiHooks<Notification>(NOTIFICATIONS_URL, 'notifications');

// Function to fetch notifications with pagination and filters
export const fetchNotificationsWithPagination = async (
  page: number = 1,
  searchTerm?: string,
  notification_type?: string,
  is_read?: boolean
): Promise<NotificationsResponse> => {
  const params: any = { page };
  if (searchTerm) {
    params.search = searchTerm;
  }
  if (notification_type) {
    params.notification_type = notification_type;
  }
  if (is_read !== undefined) {
    params.is_read = is_read;
  }
  const response = await api.get<NotificationsResponse>(NOTIFICATIONS_URL, { params });
  return response.data;
};

// Function to fetch single notification by ID
export const fetchNotificationById = async (id: number): Promise<Notification> => {
  const response = await api.get<Notification>(`${NOTIFICATIONS_URL}${id}/`);
  return response.data;
};

// Function to mark notification as read
export const markNotificationAsRead = async (id: number): Promise<Notification> => {
  const response = await api.patch<Notification>(`${NOTIFICATIONS_URL}${id}/`, {
    is_read: true
  });
  return response.data;
};

// Function to fetch all notifications across all pages
export const fetchAllNotifications = async (): Promise<Notification[]> => {
  let allNotifications: Notification[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await api.get<NotificationsResponse>(NOTIFICATIONS_URL, {
        params: { page: currentPage }
      });

      allNotifications = [...allNotifications, ...response.data.results];

      // Check if there's a next page
      hasMorePages = response.data.next !== null;
      currentPage++;
    } catch (error) {
      console.error('Error fetching notifications page:', currentPage, error);
      hasMorePages = false;
    }
  }

  return allNotifications;
};

// Helper function to get notification type label
export const getNotificationTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    post_rejected: 'Post Rejected',
    post_approved: 'Post Approved',
    post_published: 'Post Published',
    payment_received: 'Payment Received',
    info: 'Information',
    warning: 'Warning',
    error: 'Error',
  };
  return types[type] || type;
};

// Helper function to get notification type color
export const getNotificationTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    post_rejected: 'bg-red-100 text-red-800',
    post_approved: 'bg-green-100 text-green-800',
    post_published: 'bg-blue-100 text-blue-800',
    payment_received: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// Function to fetch notification statistics
export const fetchNotificationStats = async (): Promise<NotificationStats> => {
  const response = await api.get<NotificationStats>(`${NOTIFICATIONS_URL}stats/`);
  return response.data;
};
