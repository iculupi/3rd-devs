import { HttpClient } from '../clients/HttpClient';
import { API_ENDPOINTS } from '../../core/constants';
import axios from 'axios';

export class CentralaSearchHandler {
  private httpClient: HttpClient;
  
  constructor() {
    this.httpClient = new HttpClient(API_ENDPOINTS.CENTRALA);
  }

  async searchPeople(query: string): Promise<Record<string, string[]>> {
    try {
      const response = await this.httpClient.post<{message: string}>('/people', {
        apikey: process.env.PERSONAL_API_KEY,
        query: query.toUpperCase()
      });
      
      const results = response.message
        .replaceAll("[**RESTRICTED DATA**]", "**RESTRICTED_DATA**")
        .split(" ")
        .filter(item => item && !item.includes("/"));
      
      return { [query]: results };
    } catch (error) {
      console.error(`Error searching people for ${query}:`, error);
      return { [query]: [] };
    }
  }

  async searchPlaces(query: string): Promise<Record<string, string[]>> {
    try {
      const response = await this.httpClient.post<{message: string}>('/places', {
        apikey: process.env.PERSONAL_API_KEY,
        query: query.toUpperCase()
      });
      
      const results = response.message
        .replaceAll("[**RESTRICTED DATA**]", "**RESTRICTED_DATA**")
        .split(" ")
        .filter(item => item && !item.includes("/"));
      
      return { [query]: results };
    } catch (error) {
      console.error(`Error searching places for ${query}:`, error);
      return { [query]: [] };
    }
  }

  async fetchInitialData(): Promise<string> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.CENTRALA}/data/${process.env.PERSONAL_API_KEY}/barbara.txt`,
        {
          headers: {
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching initial data:", error);
      throw error;
    }
  }
} 