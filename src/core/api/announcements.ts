import { createResourceApiHooks } from '../helpers/createResourceApi'
import api from './api'

// Types
export interface District {
  id: number;
  translations: {
    ru?: {
      name: string;
    };
    en?: {
      name: string;
    };
  };
  order: number;
  is_active: boolean;
}

export interface AnnouncementImage {
  id: number;
  image: string;
  image_url: string;
  image_small_url: string;
  image_medium_url: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  building_type: string | null;
  condition: string | null;
  district: District | null;
  latitude: string | null;
  longitude: string | null;
  price: string;
  currency: string;
  area: string;
  area_unit: string;
  rooms: number | null;
  floor: number | null;
  total_floors: number | null;
  phone: string;
  images: AnnouncementImage[];
  seller: number;
  seller_name: string;
  seller_phone: string | null;
  status: string;
  payment_status: string;
  is_moderated: boolean;
  moderated_by: number | null;
  moderated_by_name: string | null;
  moderated_at: string | null;
  rejection_reason: string;
  is_featured: boolean;
  featured_until: string | null;
  promotion_type: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  posted_at: string | null;
}

export interface AnnouncementsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Announcement[];
}

// API endpoints
const ANNOUNCEMENTS_URL = 'announcements/';

// Create announcements API hooks using the factory function
export const {
  useGetResources: useGetAnnouncements,
  useGetResource: useGetAnnouncement,
  useCreateResource: useCreateAnnouncement,
  useUpdateResource: useUpdateAnnouncement,
  useDeleteResource: useDeleteAnnouncement,
} = createResourceApiHooks<Announcement>(ANNOUNCEMENTS_URL, 'announcements');

// Function to fetch announcements with pagination and filters
export const fetchAnnouncementsWithPagination = async (
  page: number = 1,
  searchTerm?: string,
  status?: string,
  listing_type?: string
): Promise<AnnouncementsResponse> => {
  const params: any = { page };
  if (searchTerm) {
    params.search = searchTerm;
  }
  if (status) {
    params.status = status;
  }
  if (listing_type) {
    params.listing_type = listing_type;
  }
  const response = await api.get<AnnouncementsResponse>(ANNOUNCEMENTS_URL, { params });
  return response.data;
};

// Function to fetch single announcement by ID
export const fetchAnnouncementById = async (id: string): Promise<Announcement> => {
  const response = await api.get<Announcement>(`${ANNOUNCEMENTS_URL}${id}/`);
  return response.data;
};

// Function to fetch all announcements across all pages
export const fetchAllAnnouncements = async (): Promise<Announcement[]> => {
  let allAnnouncements: Announcement[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await api.get<AnnouncementsResponse>(ANNOUNCEMENTS_URL, {
        params: { page: currentPage }
      });

      allAnnouncements = [...allAnnouncements, ...response.data.results];

      // Check if there's a next page
      hasMorePages = response.data.next !== null;
      currentPage++;
    } catch (error) {
      console.error('Error fetching announcements page:', currentPage, error);
      hasMorePages = false;
    }
  }

  return allAnnouncements;
};
