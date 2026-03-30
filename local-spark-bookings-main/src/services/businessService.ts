import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type Service = Tables<'services'>;

export async function getBusinessById(id: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getBusinessByOwner(ownerId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getBusinessServices(businessId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addService(params: {
  businessId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}) {
  const { data, error } = await supabase.from('services').insert({
    business_id: params.businessId,
    name: params.name,
    description: params.description,
    price: params.price,
    duration_minutes: params.durationMinutes,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id: string, params: {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
}) {
  const update: any = {};
  if (params.name !== undefined) update.name = params.name;
  if (params.description !== undefined) update.description = params.description;
  if (params.price !== undefined) update.price = params.price;
  if (params.durationMinutes !== undefined) update.duration_minutes = params.durationMinutes;

  const { data, error } = await supabase
    .from('services')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function updateBusinessWorkingHours(businessId: string, workingHours: any) {
  const { error } = await supabase
    .from('businesses')
    .update({ working_hours: workingHours })
    .eq('id', businessId);
  if (error) throw error;
}

export async function searchBusinesses(params: {
  search?: string;
  category?: string;
  city?: string;
  neighborhood?: string;
}) {
  let query = supabase.from('businesses').select('*');

  if (params.category) query = query.eq('category', params.category);
  if (params.city) query = query.eq('city', params.city);
  if (params.neighborhood) query = query.eq('neighborhood', params.neighborhood);
  if (params.search) query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);

  const { data, error } = await query.order('average_rating', { ascending: false });
  if (error) throw error;
  return data || [];
}
