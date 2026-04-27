import axios from 'axios';

const BASE_URL = '/api/categories';

/**
 * Fetch all product categories for the Home page Shop By Category section.
 * GET /api/categories
 */
export const getAllCategories = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};
