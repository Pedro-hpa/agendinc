import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getAvailableSlots, createBooking } from '@/services/bookingService';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type Service = Tables<'services'>;

interface WorkingHoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface BookingModalProps {
  business: Business;
  service: Service;
  onClose: () => void;
}

const BookingModal = ({ business, service, onClose }: BookingModalProps) => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<'datetime' | 'info' | 'confirmed'>('datetime');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);

  const workingHours = (business.working_hours as unknown as WorkingHoursEntry[]) || [];

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return {
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, "EEE, dd 'de' MMM", { locale: ptBR }),
      dayOfWeek: d.getDay(),
    };
  });

  const availableDates = dates.filter(d => {
    const hours = workingHours.find((h: WorkingHoursEntry) => h.dayOfWeek === d.dayOfWeek);
    return hours?.isOpen;
  });

  const handleDateSelect = async (dateValue: string) => {
    setSelectedDate(dateValue);
    setSelectedTime('');
    setLoadingSlots(true);
    try {
      const result = await getAvailableSlots(
        business.id,
        dateValue,
        service.duration_minutes,
        workingHours
      );
      setSlots(result);
    } catch {
      toast.error('Erro ao carregar horários.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const availableSlots = slots.filter(s => s.available);

  const handleConfirm = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para agendar.');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        userId: user.id,
        businessId: business.id,
        serviceId: service.id,
        date: selectedDate,
        time: selectedTime,
        customerName: name.trim(),
        customerPhone: phone.trim(),
      });
      setStep('confirmed');
      toast.success('Agendamento criado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeDisplay = (t: string) => t.substring(0, 5);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-8 border border-border shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Faça login para agendar</h3>
          <p className="text-muted-foreground mb-4">Você precisa ter uma conta para fazer agendamentos.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium">Fechar</button>
            <a href="/auth" className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium">Entrar / Criar Conta</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h3 className="font-semibold text-card-foreground">Agendar: {service.name}</h3>
            <p className="text-sm text-muted-foreground">R$ {Number(service.price).toFixed(2)} · {service.duration_minutes} min</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {step === 'datetime' && (
            <>
              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground">Escolha a data</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableDates.map(d => (
                    <button
                      key={d.value}
                      onClick={() => handleDateSelect(d.value)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        selectedDate === d.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="space-y-3">
                  <h4 className="font-medium text-card-foreground">Escolha o horário</h4>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum horário disponível nesta data.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(s => (
                        <button
                          key={s.time}
                          onClick={() => setSelectedTime(s.time)}
                          className={`py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedTime === s.time
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {formatTimeDisplay(s.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTime && (
                <button
                  onClick={() => setStep('info')}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Continuar
                </button>
              )}
            </>
          )}

          {step === 'info' && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-3 text-sm text-secondary-foreground">
                📅 {format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })} às {formatTimeDisplay(selectedTime)}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Seu nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 99999-0000"
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('datetime')}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Agendando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Agendamento Criado!</h3>
              <p className="text-muted-foreground text-sm">
                {service.name} em {business.name}<br />
                {format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })} às {formatTimeDisplay(selectedTime)}
              </p>
              <p className="text-xs text-muted-foreground">Status: Pendente (aguarde confirmação do negócio)</p>
              <button
                onClick={onClose}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
