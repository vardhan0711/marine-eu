import { apiClient } from './api-client';

export interface Route {
  id: string;
  originPort: string;
  destinationPort: string;
  distance: number;
  routeType: 'INTRA_EU' | 'EXTRA_EU' | 'MIXED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteInput {
  originPort: string;
  destinationPort: string;
  distance: number;
  routeType: 'INTRA_EU' | 'EXTRA_EU' | 'MIXED';
}

export interface UpdateRouteInput {
  originPort?: string;
  destinationPort?: string;
  distance?: number;
  routeType?: 'INTRA_EU' | 'EXTRA_EU' | 'MIXED';
}

export const routesApi = {
  getAll: async (params?: { originPort?: string; destinationPort?: string }): Promise<Route[]> => {
    const response = await apiClient.get('/routes', { params });
    // Backend returns { routes: [...] } - array of Route domain objects
    const routes: Route[] = response.data?.routes || [];
    
    // Filter by params if provided (client-side filtering)
    let filtered = routes;
    if (params?.originPort) {
      filtered = filtered.filter(r => 
        r.originPort?.toLowerCase().includes(params.originPort!.toLowerCase())
      );
    }
    if (params?.destinationPort) {
      filtered = filtered.filter(r => 
        r.destinationPort?.toLowerCase().includes(params.destinationPort!.toLowerCase())
      );
    }
    
    return filtered;
  },

  getById: async (id: string): Promise<Route> => {
    const response = await apiClient.get(`/routes/${id}`);
    return response.data.route;
  },

  create: async (input: CreateRouteInput): Promise<Route> => {
    const response = await apiClient.post('/routes', input);
    return response.data.route;
  },

  update: async (id: string, input: UpdateRouteInput): Promise<Route> => {
    const response = await apiClient.put(`/routes/${id}`, input);
    return response.data.route;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/routes/${id}`);
  },
};

