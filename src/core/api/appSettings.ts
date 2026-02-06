import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Types
export interface AppSettings {
  id: number;
  payment_enabled: boolean;
  featured_enabled: boolean;
  post_price: string;
  featured_price: string;
  post_duration_days: number;
  featured_duration_days: number;
  require_moderation: boolean;
  auto_deactivate_expired: boolean;
  notify_expiring_days: number;
  max_images_per_post: number;
  max_draft_announcements: number;
  admin_phone: string;
  created_at: string;
  updated_at: string;
}

// API endpoints
const APP_SETTINGS_URL = 'settings/app/';

// Get app settings
export const useGetAppSettings = () => {
  return useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const response = await api.get<AppSettings>(APP_SETTINGS_URL);
      return response.data;
    },
  });
};

// Update app settings
export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      const response = await api.put<AppSettings>(APP_SETTINGS_URL, settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
    },
  });
};
