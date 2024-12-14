import axios from 'axios';
import type { JsonData } from '../types';

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
        const response = await api.get<T>(url, {
            // Dodajemy responseType: 'text' dla plików tekstowych
            responseType: 'text',
            // Dodajemy nagłówek Accept dla tekstu
            headers: {
                'Accept': 'text/plain'
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: url
            });
        }
        throw error;
    }
}

// Type guard for JsonData
function isJsonData(data: any): data is JsonData {
    return data && typeof data === 'object';
} 