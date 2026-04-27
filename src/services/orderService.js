import axios from 'axios';

const API_URL = '/api/orders';

export const orderService = {
    getOrdersByCustomer: async (customerId) => {
        const response = await axios.get(`${API_URL}/customer/${customerId}`);
        return response.data;
    }
};
