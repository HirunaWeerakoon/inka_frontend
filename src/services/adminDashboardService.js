import axios from 'axios';

// Dashboard stats API calls
const BASE_URL = '/api/admin/dashboard';

/**
 * Fetch dashboard stat cards data.
 * GET /api/admin/dashboard/stats
 */
export const adminGetStats = async () => {
  const response = await axios.get(`${BASE_URL}/stats`);
  return response.data;
};