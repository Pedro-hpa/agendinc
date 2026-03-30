import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBusinessByOwner,
  getBusinessServices,
  addService,
  updateService,
  deleteService,
  updateBusinessWorkingHours,
  searchBusinesses,
  getBusinessById,
} from '@/services/businessService';
import {
  getBusinessBookings,
  updateBookingStatus,
  getBlockedTimes,
  addBlockedTime,
  removeBlockedTime,
} from '@/services/bookingService';
import { toast } from 'sonner';

export function useOwnerBusiness(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['owner-business', ownerId],
    queryFn: () => getBusinessByOwner(ownerId!),
    enabled: !!ownerId,
  });
}

export function useBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusinessById(businessId!),
    enabled: !!businessId,
  });
}

export function useBusinessServices(businessId: string | undefined) {
  return useQuery({
    queryKey: ['services', businessId],
    queryFn: () => getBusinessServices(businessId!),
    enabled: !!businessId,
  });
}

export function useBusinessBookings(businessId: string | undefined) {
  return useQuery({
    queryKey: ['bookings', businessId],
    queryFn: () => getBusinessBookings(businessId!),
    enabled: !!businessId,
  });
}

export function useBlockedTimes(businessId: string | undefined) {
  return useQuery({
    queryKey: ['blocked-times', businessId],
    queryFn: () => getBlockedTimes(businessId!),
    enabled: !!businessId,
  });
}

export function useSearchBusinesses(params: {
  search?: string;
  category?: string;
  city?: string;
  neighborhood?: string;
}) {
  return useQuery({
    queryKey: ['businesses', params],
    queryFn: () => searchBusinesses(params),
  });
}

export function useAddService(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Serviço adicionado!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}

export function useUpdateService(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string; name?: string; description?: string; price?: number; durationMinutes?: number }) =>
      updateService(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Serviço atualizado!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}

export function useDeleteService(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Serviço removido!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}

export function useUpdateBookingStatus(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', businessId] });
      toast.success('Status atualizado!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}

export function useAddBlockedTime(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addBlockedTime,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-times', businessId] });
      toast.success('Horário bloqueado!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}

export function useRemoveBlockedTime(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeBlockedTime,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-times', businessId] });
      toast.success('Bloqueio removido!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}

export function useUpdateWorkingHours(businessId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workingHours: any) => updateBusinessWorkingHours(businessId, workingHours),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-business'] });
      toast.success('Horários atualizados!');
    },
    onError: (err: any) => toast.error('Erro: ' + err.message),
  });
}
