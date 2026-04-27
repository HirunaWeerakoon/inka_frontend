import axios from 'axios';

const BASE_URL = '/api/products';
let productsCache = null;
let productsCachePromise = null;

/**
 * Fetch all best-seller products for the Home page.
 * GET /api/products/bestsellers
 */
export const getBestSellerProducts = async () => {
  const response = await axios.get(`${BASE_URL}/bestsellers`);
  return response.data;
};

/**
 * Fetch all available products.
 * GET /api/products
 */
export const getAllProducts = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * Fetch all products once and reuse them for subsequent requests.
 */
const getAllProductsCached = async () => {
  if (Array.isArray(productsCache)) {
    return productsCache;
  }

  if (productsCachePromise) {
    return productsCachePromise;
  }

  productsCachePromise = getAllProducts()
    .then((data) => {
      productsCache = Array.isArray(data) ? data : [];
      return productsCache;
    })
    .finally(() => {
      productsCachePromise = null;
    });

  return productsCachePromise;
};

/**
 * Fetch products filtered by category.
 * GET /api/products/category/:categoryId
 */
export const getProductsByCategory = async (categoryId) => {
  const response = await axios.get(`${BASE_URL}/category/${categoryId}`);
  return response.data;
};

/**
 * Search products by a free-text query against name, category, and description.
 */
export const searchProducts = async (query) => {
  const products = await getAllProductsCached();
  const searchTerm = (query || '').trim().toLowerCase();

  if (!searchTerm) {
    return Array.isArray(products) ? products : [];
  }

  return (Array.isArray(products) ? products : []).filter((product) => {
    const categoryName = product.categoryName || product.category?.categoryName || '';
    const searchableText = `${product.name || ''} ${categoryName} ${product.description || ''}`.toLowerCase();
    return searchableText.includes(searchTerm);
  });
};

/**
 * Get up to 4 products related to the given product.
 * Priority: same category, excluding the current product.
 */
export const getRelatedProducts = async (currentProduct, limit = 4) => {
  if (!currentProduct?.productId) {
    return [];
  }

  const products = await getAllProductsCached();
  const currentCategoryId = currentProduct.categoryId || currentProduct.category?.categoryId;
  const currentCategoryName = (currentProduct.categoryName || currentProduct.category?.categoryName || '').toLowerCase();

  const sameCategoryProducts = products.filter((product) => {
    if (!product || product.productId === currentProduct.productId) {
      return false;
    }

    const productCategoryId = product.categoryId || product.category?.categoryId;
    const productCategoryName = (product.categoryName || product.category?.categoryName || '').toLowerCase();

    if (currentCategoryId && productCategoryId) {
      return productCategoryId === currentCategoryId;
    }

    if (currentCategoryName && productCategoryName) {
      return productCategoryName === currentCategoryName;
    }

    return false;
  });

  if (sameCategoryProducts.length >= limit) {
    return sameCategoryProducts.slice(0, limit);
  }

  const fallbackProducts = products.filter((product) => {
    if (!product || product.productId === currentProduct.productId) {
      return false;
    }

    return !sameCategoryProducts.some((sameCategoryProduct) => sameCategoryProduct.productId === product.productId);
  });

  return [...sameCategoryProducts, ...fallbackProducts].slice(0, limit);
};
