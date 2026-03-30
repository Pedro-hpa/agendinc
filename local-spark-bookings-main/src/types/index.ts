export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: Category;
  city: string;
  neighborhood: string;
  imageUrl: string;
  workingHours: WorkingHours[];
  averageRating: number;
  reviewCount: number;
}

export type Category = 'barber' | 'hair_salon' | 'nail_tech' | 'car_wash' | 'massage' | 'pet_grooming';

export const CATEGORY_LABELS: Record<Category, string> = {
  barber: 'Barbearia',
  hair_salon: 'Salão de Cabelo',
  nail_tech: 'Manicure',
  car_wash: 'Lava-Jato',
  massage: 'Massagem',
  pet_grooming: 'Pet Shop',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  barber: '💈',
  hair_salon: '💇',
  nail_tech: '💅',
  car_wash: '🚗',
  massage: '💆',
  pet_grooming: '🐾',
};

export interface WorkingHours {
  dayOfWeek: number; // 0=Sunday
  openTime: string;  // "09:00"
  closeTime: string; // "18:00"
  isOpen: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  businessId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  date: string; // "2024-01-15"
  time: string; // "14:00"
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'customer';
}

export const CITIES = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Porto Alegre',
];

export const NEIGHBORHOODS: Record<string, string[]> = {
  'São Paulo': ['Pinheiros', 'Vila Mariana', 'Moema', 'Itaim Bibi', 'Consolação'],
  'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Botafogo', 'Tijuca', 'Barra da Tijuca'],
  'Belo Horizonte': ['Savassi', 'Lourdes', 'Funcionários', 'Centro', 'Buritis'],
  'Curitiba': ['Batel', 'Centro', 'Água Verde', 'Juvevê', 'Santa Felicidade'],
  'Porto Alegre': ['Moinhos de Vento', 'Centro', 'Petrópolis', 'Bom Fim', 'Menino Deus'],
};
