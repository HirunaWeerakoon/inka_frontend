import axios from 'axios';

// All admin user API calls go through /api/admin/users
const BASE_URL = '/api/admin/users';

/**
 * Fetch all registered users for admin panel.
 * GET /api/admin/users
 */
export const adminGetAllUsers = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * Delete a user by ID.
 * DELETE /api/admin/users/:id
 */
export const adminDeleteUser = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};