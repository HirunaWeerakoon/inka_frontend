import axios from 'axios';

const API_URL = '/api/cart';

export const cartService = {
    getCart: async (customerId) => {
        try {
            const response = await axios.get(`${API_URL}/${customerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    addToCart: async (customerId, productId, quantity = 1) => {
        try {
            const response = await axios.post(`${API_URL}/${customerId}/add`, {
                productId,
                quantity,
            });
            return response.data;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    updateQuantity: async (itemId, quantity) => {
        try {
            const response = await axios.put(`${API_URL}/item/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    },

    removeItem: async (itemId) => {
        try {
            await axios.delete(`${API_URL}/item/${itemId}`);
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw error;
        }
    },

    clearCart: async (customerId) => {
        try {
            await axios.delete(`${API_URL}/${customerId}/clear`);
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    },
};
