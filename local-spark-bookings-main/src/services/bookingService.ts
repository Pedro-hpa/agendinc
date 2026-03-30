import { supabase } from '@/integrations/supabase/client';

export interface TimeSlot {
  time: string; // "HH:MM:00"
  available: boolean;
}

interface WorkingHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

/**
 * Generate available time slots for a business on a given date,
 * considering working hours, existing bookings, blocked times, and service duration.
 */
export async function getAvailableSlots(
  businessId: string,
  date: string,
  serviceDurationMinutes: number,
  workingHours: WorkingHoursEntry[]
): Promise<TimeSlot[]> {
  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();
  const hours = workingHours.find(h => h.dayOfWeek === dayOfWeek);
  if (!hours?.isOpen) return [];

  // Fetch booked slots and blocked times in parallel
  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('time, services(duration_minutes)')
      .eq('business_id', businessId)
      .eq('date', date)
      .neq('status', 'cancelled'),
    supabase
      .from('blocked_times')
      .select('start_time, end_time')
      .eq('business_id', businessId)
      .eq('date', date),
  ]);

  const bookedRanges = (bookingsRes.data || []).map((b: any) => {
    const [h, m] = b.time.split(':').map(Number);
    const start = h * 60 + m;
    const duration = b.services?.duration_minutes || 30;
    return { start, end: start + duration };
  });

  const blockedRanges = (blockedRes.data || []).map((b: any) => {
    const [sh, sm] = b.start_time.split(':').map(Number);
    const [eh, em] = b.end_time.split(':').map(Number);
    return { start: sh * 60 + sm, end: eh * 60 + em };
  });

  const [startH, startM] = hours.openTime.split(':').map(Number);
  const [endH, endM] = hours.closeTime.split(':').map(Number);
  const openMinutes = startH * 60 + startM;
  const closeMinutes = endH * 60 + endM;

  const slots: TimeSlot[] = [];

  for (let m = openMinutes; m + serviceDurationMinutes <= closeMinutes; m += 30) {
    const slotEnd = m + serviceDurationMinutes;
    const overlapsBooking = bookedRanges.some(
      (r: { start: number; end: number }) => m < r.end && slotEnd > r.start
    );
    const overlapsBlocked = blockedRanges.some(
      (r: { start: number; end: number }) => m < r.end && slotEnd > r.start
    );

    const h = Math.floor(m / 60);
    const min = m % 60;
    const time = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;

    slots.push({
      time,
      available: !overlapsBooking && !overlapsBlocked,
    });
  }

  return slots;
}

export async function createBooking(params: {
  userId: string;
  businessId: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
}) {
  // Server-side re-validation: check for conflicts
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('business_id', params.businessId)
    .eq('date', params.date)
    .eq('time', params.time)
    .neq('status', 'cancelled');

  if (conflicts && conflicts.length > 0) {
    throw new Error('Este horário já foi reservado. Escolha outro.');
  }

  const { data, error } = await supabase.from('bookings').insert({
    user_id: params.userId,
    business_id: params.businessId,
    service_id: params.serviceId,
    date: params.date,
    time: params.time,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    status: 'pending',
  }).select().single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este horário já foi reservado. Escolha outro.');
    }
    throw error;
  }

  return data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
  if (error) throw error;
}

export async function getBusinessBookings(businessId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name, price, duration_minutes)')
    .eq('business_id', businessId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBlockedTimes(businessId: string) {
  const { data, error } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('business_id', businessId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addBlockedTime(params: {
  businessId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) {
  const { data, error } = await supabase.from('blocked_times').insert({
    business_id: params.businessId,
    date: params.date,
    start_time: params.startTime,
    end_time: params.endTime,
    reason: params.reason || '',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function removeBlockedTime(id: string) {
  const { error } = await supabase.from('blocked_times').delete().eq('id', id);
  if (error) throw error;
}
