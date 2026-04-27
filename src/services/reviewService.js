import axios from 'axios';
import { authService } from './authService';

const BASE_URL = '/api/reviews';

// Get all reviews for a product — no token needed
export const getReviewsByProduct = async (productId) => {
    const response = await axios.get(`${BASE_URL}/product/${productId}`);
    return response.data;
};

// Get average rating for a product — no token needed
export const getAverageRating = async (productId) => {
    const response = await axios.get(`${BASE_URL}/product/${productId}/average`);
    return response.data;
};

// Submit a new review — token required
export const createReview = async (reviewData) => {
    const token = authService.getToken();
    const response = await axios.post(BASE_URL, reviewData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

// Delete a review — token required
export const deleteReview = async (reviewId) => {
    const token = authService.getToken();
    const response = await axios.delete(`${BASE_URL}/${reviewId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};