import axios from 'axios';

// All admin stock API calls go through /api/admin/stock
const BASE_URL = '/api/admin/stock';

/**
 * Fetch ALL products with their stock levels for admin stock view.
 * GET /api/admin/stock
 */
export const adminGetAllStock = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * Update stock for a specific product by ID.
 * PATCH /api/admin/stock/:id
 */
export const adminUpdateStock = async (id, newStock) => {
  const response = await axios.patch(`${BASE_URL}/${id}`, { stock: newStock });
  return response.data;
};