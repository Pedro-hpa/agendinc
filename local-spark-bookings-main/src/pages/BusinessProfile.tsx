import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, Timer, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from '@/types';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import BookingModal from '@/components/BookingModal';
import ReviewSection from '@/components/ReviewSection';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type Service = Tables<'services'>;
type Review = Tables<'reviews'>;

interface WorkingHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const BusinessProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<(Review & { profiles?: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const [bizRes, svcRes, revRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', id).maybeSingle(),
        supabase.from('services').select('*').eq('business_id', id),
        supabase.from('reviews').select('*, profiles(name)').eq('business_id', id).order('created_at', { ascending: false }),
      ]);
      if (bizRes.data) setBusiness(bizRes.data);
      if (svcRes.data) setServices(svcRes.data);
      if (revRes.data) setReviews(revRes.data as any);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Negócio não encontrado.
        </div>
      </div>
    );
  }

  const workingHours = (business.working_hours as unknown as WorkingHoursEntry[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero image */}
      {business.image_url && (
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg p-6 border border-border space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              {CATEGORY_ICONS[business.category as Category]} {CATEGORY_LABELS[business.category as Category]}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">{business.name}</h1>
          <p className="text-muted-foreground">{business.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {business.neighborhood}, {business.city}
            </span>
            <span className="flex items-center gap-2">
              <StarRating rating={business.average_rating || 0} size={14} />
              <span className="font-medium text-card-foreground">{business.average_rating || 0}</span>
              <span>({business.review_count || 0} avaliações)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Serviços</h2>
          {services.length === 0 ? (
            <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {services.map(service => (
                <div key={service.id} className="bg-card rounded-xl p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-card-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} /> R$ {Number(service.price).toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer size={14} /> {service.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(service)}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Agendar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          <ReviewSection businessId={business.id} reviews={reviews} />
        </div>

        {/* Working Hours */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Horário de Funcionamento</h2>
          {workingHours.length === 0 ? (
            <p className="text-muted-foreground text-sm">Horários não cadastrados.</p>
          ) : (
            <div className="bg-card rounded-xl p-4 border border-border space-y-2">
              {workingHours.map((h: WorkingHoursEntry) => (
                <div key={h.dayOfWeek} className="flex items-center justify-between text-sm">
                  <span className="text-card-foreground font-medium">{DAY_NAMES[h.dayOfWeek]}</span>
                  {h.isOpen ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} /> {h.openTime} - {h.closeTime}
                    </span>
                  ) : (
                    <span className="text-destructive text-xs">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedService && business && (
        <BookingModal
          business={business}
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

export default BusinessProfile;
