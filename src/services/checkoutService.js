import axios from 'axios';

export const checkoutService = {
    createCartSession: async (customerId) => {
        const response = await axios.post(`/api/checkout/cart/${customerId}`);
        return response.data;
    },

    createCustomOrderSession: async (customOrderId) => {
        const response = await axios.post(`/api/checkout/custom-order/${customOrderId}`);
        return response.data;
    },

    createCustomOrdersSession: async (customOrderIds) => {
        const response = await axios.post('/api/checkout/custom-orders', { customOrderIds });
        return response.data;
    },

    createMixedSession: async (customerId, customOrderIds) => {
        const response = await axios.post(`/api/checkout/mixed?customerId=${customerId}`, { customOrderIds });
        return response.data;
    },
};