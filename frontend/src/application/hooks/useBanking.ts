import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bankingApi,
  BankSurplusInput,
  ApplyBankedInput,
} from '@/adapters/api/banking-api';

export function useBankEntries(params?: { shipId?: string; expired?: boolean }) {
  return useQuery({
    queryKey: ['bank-entries', params],
    queryFn: () => bankingApi.getEntries(params),
  });
}

export function useBankSurplus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BankSurplusInput) => bankingApi.bankSurplus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-entries'] });
    },
  });
}

export function useApplyBanked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ApplyBankedInput) => bankingApi.applyBanked(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-entries'] });
    },
  });
}

export function useDeleteBankEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankingApi.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-entries'] });
    },
  });
}

