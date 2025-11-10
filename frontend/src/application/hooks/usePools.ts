import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  poolsApi,
  Pool,
  CreatePoolInput,
  PoolMember,
} from '@/adapters/api/pools-api';

export function usePools(params?: { status?: string; poolType?: string; shipId?: string }) {
  return useQuery({
    queryKey: ['pools', params],
    queryFn: () => poolsApi.getAll(params),
  });
}

export function usePool(id: string | null) {
  return useQuery({
    queryKey: ['pool', id],
    queryFn: () => (id ? poolsApi.getById(id) : null),
    enabled: !!id,
  });
}

export function usePoolMembers(id: string | null) {
  return useQuery({
    queryKey: ['pool-members', id],
    queryFn: () => (id ? poolsApi.getMembers(id) : null),
    enabled: !!id,
  });
}

export function useCreatePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePoolInput) => poolsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}

export function useUpdatePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreatePoolInput> }) =>
      poolsApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      queryClient.invalidateQueries({ queryKey: ['pool', variables.id] });
    },
  });
}

export function useDeletePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => poolsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}

export function useAddPoolMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shipId, units }: { id: string; shipId: string; units: number }) =>
      poolsApi.addMember(id, shipId, units),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool-members', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pool', variables.id] });
    },
  });
}

export function useRemovePoolMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shipId }: { id: string; shipId: string }) =>
      poolsApi.removeMember(id, shipId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool-members', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pool', variables.id] });
    },
  });
}

