import api from './api';

export const fetchDashboardData = async (params?: Record<string, string>) => {
    const response = await api.get('/dashboard/', { params });
    return response.data;
};
