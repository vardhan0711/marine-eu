import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesApi, Route, CreateRouteInput, UpdateRouteInput } from '@/adapters/api/routes-api';

export function useRoutes(params?: { originPort?: string; destinationPort?: string }) {
  return useQuery({
    queryKey: ['routes', params],
    queryFn: () => routesApi.getAll(params),
  });
}

export function useRoute(id: string | null) {
  return useQuery({
    queryKey: ['route', id],
    queryFn: () => (id ? routesApi.getById(id) : null),
    enabled: !!id,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRouteInput) => routesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRouteInput }) =>
      routesApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.id] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => routesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

