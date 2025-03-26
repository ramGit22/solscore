import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * API for interacting with the backend
 */
export const api = {
  /**
   * Get HHI for a token mint
   * @param mint Token mint address
   * @returns Promise with HHI data
   */
  async getHHI(mint: string) {
    try {
      const response = await axios.get(`${API_URL}/api/hhi`, {
        params: { mint }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching HHI:', error);
      throw error;
    }
  }
};