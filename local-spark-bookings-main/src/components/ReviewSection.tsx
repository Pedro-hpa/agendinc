import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'>;

interface ReviewSectionProps {
  businessId: string;
  reviews: (Review & { profiles?: { name: string } | null })[];
}

const ReviewSection = ({ businessId, reviews: initialReviews }: ReviewSectionProps) => {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para avaliar.');
      return;
    }
    if (!rating || !comment.trim()) {
      toast.error('Preencha todos os campos e escolha uma nota.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.from('reviews').insert({
      user_id: user.id,
      business_id: businessId,
      rating,
      comment: comment.trim(),
    }).select('*, profiles(name)').single();

    if (error) {
      if (error.code === '23505') {
        toast.error('Você já avaliou este negócio.');
      } else {
        toast.error('Erro ao enviar avaliação: ' + error.message);
      }
      setSubmitting(false);
      return;
    }

    setReviews(prev => [data as any, ...prev]);
    setShowForm(false);
    setRating(0);
    setComment('');
    toast.success('Avaliação enviada!');
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Avaliações ({reviews.length})</h2>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showForm ? 'Cancelar' : 'Avaliar'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Sua nota</label>
            <StarRating rating={rating} size={24} interactive onRate={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Comentário</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-card rounded-xl p-4 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-card-foreground">{r.profiles?.name || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <StarRating rating={r.rating} size={14} />
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
