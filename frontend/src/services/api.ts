import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
);

export interface BuyCornResponse {
  success: boolean;
  message: string;
  purchase: {
    id: number;
    purchasedAt: string;
  };
}

export interface ClientStats {
  clientId: string;
  totalPurchases: number;
  lastPurchase: string | null;
}

export interface ErrorResponse {
  error: string;
  message: string;
  retryAfter?: number;
}

/**
 * Buy corn API call
 * @param clientId - Unique client identifier
 * @returns Promise with purchase details
 * @throws AxiosError with 429 status if rate limited
 */
export const buyCornAPI = async (clientId: string): Promise<BuyCornResponse> => {
  if (!clientId || clientId.trim() === '') {
    throw new Error('Client ID is required');
  }

  const response = await api.post<BuyCornResponse>(
    '/buy-corn',
    {},
    {
      headers: {
        'x-client-id': clientId,
      },
    }
  );
  return response.data;
};

/**
 * Get client statistics API call
 * @param clientId - Unique client identifier
 * @returns Promise with client statistics
 */
export const getClientStatsAPI = async (clientId: string): Promise<ClientStats> => {
  if (!clientId || clientId.trim() === '') {
    throw new Error('Client ID is required');
  }

  const response = await api.get<ClientStats>(`/stats/${encodeURIComponent(clientId)}`);
  return response.data;
};

