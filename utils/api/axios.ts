import axios from 'axios';

// Create axios instance with common configuration
export const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);

// Helper for making GET requests
export async function fetchData<T>(url: string): Promise<T> {
    try {
        const response = await api.get<T>(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        throw error;
    }
} 