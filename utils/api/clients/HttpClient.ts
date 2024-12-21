import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class HttpClient {
    private client: AxiosInstance;

    constructor(baseURL?: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    async get<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url);
        return response.data;
    }

    async post<T>(url: string, data: any): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data);
        return response.data;
    }

    async put<T>(url: string, data: any): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url);
        return response.data;
    }
} 