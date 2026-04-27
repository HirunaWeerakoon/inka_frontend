import axios from 'axios';

// All admin product API calls go through /api/admin/products
const BASE_URL = '/api/admin/products';

/**
 * Fetch ALL products (including unavailable) for admin panel.
 * GET /api/admin/products
 */
export const adminGetAllProducts = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * Create a new product.
 * POST /api/admin/products
 */
export const adminCreateProduct = async (productData) => {
  const response = await axios.post(BASE_URL, productData);
  return response.data;
};

/**
 * Update an existing product by ID.
 * PUT /api/admin/products/:id
 */
export const adminUpdateProduct = async (id, productData) => {
  const response = await axios.put(`${BASE_URL}/${id}`, productData);
  return response.data;
};

/**
 * Delete a product by ID.
 * DELETE /api/admin/products/:id
 */
export const adminDeleteProduct = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};