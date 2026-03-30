import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from '@/types';
import StarRating from './StarRating';
import type { Tables } from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;

interface WorkingHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface BusinessCardProps {
  business: Business;
}

const BusinessCard = ({ business }: BusinessCardProps) => {
  const today = new Date().getDay();
  const workingHours = (business.working_hours as unknown as WorkingHoursEntry[]) || [];
  const todayHours = workingHours.find((h: WorkingHoursEntry) => h.dayOfWeek === today);
  const isOpenNow = todayHours?.isOpen ?? false;

  return (
    <Link to={`/business/${business.id}`} className="block">
      <div className="marketplace-card group">
        {business.image_url && (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={business.image_url}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              {CATEGORY_ICONS[business.category as Category]} {CATEGORY_LABELS[business.category as Category]}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOpenNow ? 'bg-primary/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {isOpenNow ? 'Aberto' : 'Fechado'}
            </span>
          </div>
          <h3 className="font-semibold text-card-foreground text-lg leading-tight">{business.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>{business.neighborhood}, {business.city}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <StarRating rating={business.average_rating || 0} size={14} />
              <span className="text-sm font-medium text-card-foreground">{business.average_rating || 0}</span>
              <span className="text-xs text-muted-foreground">({business.review_count || 0})</span>
            </div>
            {todayHours?.isOpen && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{todayHours.openTime} - {todayHours.closeTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BusinessCard;
