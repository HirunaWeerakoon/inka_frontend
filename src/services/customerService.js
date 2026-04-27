import axios from 'axios';

const API_URL = '/api/customers';

export const customerService = {
    getCustomer: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer data:', error);
            throw error;
        }
    },

    updateCustomer: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating customer data:', error);
            throw error;
        }
    }
};
