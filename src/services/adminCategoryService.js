import axios from 'axios';

// All admin category API calls go through /api/admin/categories
const BASE_URL = '/api/admin/categories';

/**
 * Fetch ALL categories for admin panel.
 * GET /api/admin/categories
 */
export const adminGetAllCategories = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * Create a new category.
 * POST /api/admin/categories
 */
export const adminCreateCategory = async (categoryData) => {
  const response = await axios.post(BASE_URL, categoryData);
  return response.data;
};

/**
 * Update an existing category by ID.
 * PUT /api/admin/categories/:id
 */
export const adminUpdateCategory = async (id, categoryData) => {
  const response = await axios.put(`${BASE_URL}/${id}`, categoryData);
  return response.data;
};

/**
 * Delete a category by ID.
 * DELETE /api/admin/categories/:id
 */
export const adminDeleteCategory = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};