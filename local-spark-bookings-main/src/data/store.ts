import { Business, Service, Booking, Review } from '@/types';
import { mockBusinesses, mockServices, mockBookings, mockReviews } from './mockData';
import barberImg from '@/assets/barber.jpg';
import hairSalonImg from '@/assets/hair-salon.jpg';
import nailSalonImg from '@/assets/nail-salon.jpg';
import carWashImg from '@/assets/car-wash.jpg';
import massageImg from '@/assets/massage.jpg';
import petGroomingImg from '@/assets/pet-grooming.jpg';

const BUSINESS_IMAGES: Record<string, string> = {
  b1: barberImg,
  b2: hairSalonImg,
  b3: nailSalonImg,
  b4: carWashImg,
  b5: massageImg,
  b6: petGroomingImg,
};

// Simple in-memory store with localStorage persistence
const STORAGE_KEYS = {
  businesses: 'agendai_businesses',
  services: 'agendai_services',
  bookings: 'agendai_bookings',
  reviews: 'agendai_reviews',
  currentUser: 'agendai_current_user',
};

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize with images
const initBusinesses = (): Business[] => {
  const businesses = load<Business>(STORAGE_KEYS.businesses, mockBusinesses);
  return businesses.map(b => ({
    ...b,
    imageUrl: BUSINESS_IMAGES[b.id] || b.imageUrl,
  }));
};

export const store = {
  getBusinesses: (): Business[] => initBusinesses(),

  getBusiness: (id: string): Business | undefined =>
    initBusinesses().find(b => b.id === id),

  getServices: (businessId: string): Service[] =>
    load<Service>(STORAGE_KEYS.services, mockServices).filter(s => s.businessId === businessId),

  getAllServices: (): Service[] =>
    load<Service>(STORAGE_KEYS.services, mockServices),

  getBookings: (businessId: string): Booking[] =>
    load<Booking>(STORAGE_KEYS.bookings, mockBookings).filter(b => b.businessId === businessId),

  getReviews: (businessId: string): Review[] =>
    load<Review>(STORAGE_KEYS.reviews, mockReviews).filter(r => r.businessId === businessId),

  addBooking: (booking: Booking) => {
    const bookings = load<Booking>(STORAGE_KEYS.bookings, mockBookings);
    bookings.push(booking);
    save(STORAGE_KEYS.bookings, bookings);
  },

  isTimeSlotAvailable: (businessId: string, date: string, time: string, durationMinutes: number): boolean => {
    const bookings = load<Booking>(STORAGE_KEYS.bookings, mockBookings)
      .filter(b => b.businessId === businessId && b.date === date && b.status !== 'cancelled');
    const services = load<Service>(STORAGE_KEYS.services, mockServices);

    const newStart = timeToMinutes(time);
    const newEnd = newStart + durationMinutes;

    for (const booking of bookings) {
      const svc = services.find(s => s.id === booking.serviceId);
      const bStart = timeToMinutes(booking.time);
      const bEnd = bStart + (svc?.durationMinutes || 30);
      if (newStart < bEnd && newEnd > bStart) return false;
    }
    return true;
  },

  addReview: (review: Review) => {
    const reviews = load<Review>(STORAGE_KEYS.reviews, mockReviews);
    reviews.push(review);
    save(STORAGE_KEYS.reviews, reviews);

    // Update business average rating
    const businesses = load<Business>(STORAGE_KEYS.businesses, mockBusinesses);
    const bizReviews = reviews.filter(r => r.businessId === review.businessId);
    const avg = bizReviews.reduce((sum, r) => sum + r.rating, 0) / bizReviews.length;
    const biz = businesses.find(b => b.id === review.businessId);
    if (biz) {
      biz.averageRating = Math.round(avg * 10) / 10;
      biz.reviewCount = bizReviews.length;
      save(STORAGE_KEYS.businesses, businesses);
    }
  },

  addService: (service: Service) => {
    const services = load<Service>(STORAGE_KEYS.services, mockServices);
    services.push(service);
    save(STORAGE_KEYS.services, services);
  },

  removeService: (serviceId: string) => {
    const services = load<Service>(STORAGE_KEYS.services, mockServices).filter(s => s.id !== serviceId);
    save(STORAGE_KEYS.services, services);
  },

  updateBusiness: (business: Business) => {
    const businesses = load<Business>(STORAGE_KEYS.businesses, mockBusinesses);
    const idx = businesses.findIndex(b => b.id === business.id);
    if (idx >= 0) businesses[idx] = business;
    else businesses.push(business);
    save(STORAGE_KEYS.businesses, businesses);
  },

  // Simple auth
  login: (email: string): { id: string; name: string; businessId?: string } | null => {
    // For MVP: any owner email logs in to their business
    const ownerMap: Record<string, { id: string; name: string; businessId: string }> = {
      'joao@barbershop.com': { id: 'u1', name: 'João', businessId: 'b1' },
      'studio@beleza.com': { id: 'u2', name: 'Studio Beleza', businessId: 'b2' },
      'camila@nails.com': { id: 'u3', name: 'Camila', businessId: 'b3' },
      'express@lavajato.com': { id: 'u4', name: 'LavaJato', businessId: 'b4' },
      'zen@massagem.com': { id: 'u5', name: 'Espaço Zen', businessId: 'b5' },
      'pet@banhotosa.com': { id: 'u6', name: 'PetBanho', businessId: 'b6' },
    };
    return ownerMap[email] || null;
  },
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
