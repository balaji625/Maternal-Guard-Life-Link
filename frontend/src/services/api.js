import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const predictRisk = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/predict`, data);
        return response.data;
    } catch (error) {
        console.error('Error predicting risk:', error);
        throw error;
    }
};

export const trainModel = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/train`);
        return response.data;
    } catch (error) {
        console.error('Error training model:', error);
        throw error;
    }
};
