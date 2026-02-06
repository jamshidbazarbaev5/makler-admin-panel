import { createResourceApiHooks } from '../helpers/createResourceApi'
import api from './api'

// Types
export interface DistrictTranslation {
  name: string;
}

export interface DistrictTranslations {
  ru?: DistrictTranslation;
  uz?: DistrictTranslation;
  kaa?: DistrictTranslation;
  en?: DistrictTranslation;
}

export interface District {
  id: number;
  translations: DistrictTranslations;
  order: number;
  is_active: boolean;
}

export interface DistrictsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: District[];
}

// API endpoints
const DISTRICTS_URL = 'settings/districts/';

// Create districts API hooks using the factory function
export const {
  useGetResources: useGetDistricts,
  useGetResource: useGetDistrict,
  useCreateResource: useCreateDistrict,
  useUpdateResource: useUpdateDistrict,
  useDeleteResource: useDeleteDistrict,
} = createResourceApiHooks<District>(DISTRICTS_URL, 'districts');

// Function to fetch districts with pagination
export const fetchDistrictsWithPagination = async (page: number = 1, searchTerm?: string): Promise<DistrictsResponse> => {
  const params: any = { page };
  if (searchTerm) {
    params.search = searchTerm;
  }
  const response = await api.get<DistrictsResponse>(DISTRICTS_URL, { params });
  return response.data;
};

// Function to fetch all districts across all pages
export const fetchAllDistricts = async (): Promise<District[]> => {
  let allDistricts: District[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await api.get<DistrictsResponse>(DISTRICTS_URL, {
        params: { page: currentPage }
      });

      allDistricts = [...allDistricts, ...response.data.results];

      // Check if there's a next page
      hasMorePages = response.data.next !== null;
      currentPage++;
    } catch (error) {
      console.error('Error fetching districts page:', currentPage, error);
      hasMorePages = false;
    }
  }

  return allDistricts;
};

// Helper function to get district name in a specific language
export const getDistrictName = (district: District, language: string = 'ru'): string => {
  const translations = district.translations as any;
  return translations?.[language]?.name || translations?.ru?.name || 'N/A';
};
