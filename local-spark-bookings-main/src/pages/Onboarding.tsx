import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarCheck, ArrowRight, ArrowLeft, Check, Plus, Trash2, Store, Clock, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORY_LABELS, CITIES, NEIGHBORHOODS } from '@/types';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface WorkingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

interface ServiceDraft {
  name: string;
  description: string;
  price: string;
  duration: string;
}

const defaultHours: WorkingHour[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  openTime: '09:00',
  closeTime: '18:00',
  isOpen: i >= 1 && i <= 5,
}));

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Business info
  const [bizName, setBizName] = useState('');
  const [bizDesc, setBizDesc] = useState('');
  const [bizCategory, setBizCategory] = useState('barber');
  const [bizCity, setBizCity] = useState('');
  const [bizNeighborhood, setBizNeighborhood] = useState('');
  const [bizAddress, setBizAddress] = useState('');

  // Step 2: Working hours
  const [hours, setHours] = useState<WorkingHour[]>(defaultHours);

  // Step 3: Services
  const [services, setServices] = useState<ServiceDraft[]>([
    { name: '', description: '', price: '', duration: '30' },
  ]);

  const steps = [
    { icon: Store, label: 'Seu Negócio' },
    { icon: Clock, label: 'Horários' },
    { icon: Scissors, label: 'Serviços' },
  ];

  const canProceedStep0 = bizName.trim() && bizCity;
  const canProceedStep1 = true;
  const canFinish = services.some(s => s.name.trim() && s.price);

  const toggleDay = (idx: number) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, isOpen: !h.isOpen } : h));
  };

  const updateHour = (idx: number, field: 'openTime' | 'closeTime', val: string) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  };

  const addService = () => {
    setServices(prev => [...prev, { name: '', description: '', price: '', duration: '30' }]);
  };

  const removeService = (idx: number) => {
    if (services.length <= 1) return;
    setServices(prev => prev.filter((_, i) => i !== idx));
  };

  const updateService = (idx: number, field: keyof ServiceDraft, val: string) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Create business
      const { data: biz, error: bizError } = await supabase.from('businesses').insert([{
        owner_id: user.id,
        name: bizName.trim(),
        description: bizDesc.trim(),
        category: bizCategory,
        city: bizCity,
        neighborhood: bizNeighborhood,
        address: bizAddress.trim(),
        working_hours: hours as any,
      }]).select().single();

      if (bizError) throw bizError;

      // Create services
      const validServices = services.filter(s => s.name.trim() && s.price);
      if (validServices.length > 0) {
        const { error: svcError } = await supabase.from('services').insert(
          validServices.map(s => ({
            business_id: biz.id,
            name: s.name.trim(),
            description: s.description.trim(),
            price: parseFloat(s.price),
            duration_minutes: parseInt(s.duration) || 30,
          }))
        );
        if (svcError) throw svcError;
      }

      toast.success('Negócio criado com sucesso! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Erro: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2">
          <CalendarCheck className="text-primary" size={24} />
          <span className="text-lg font-bold text-foreground">AgendaÍ</span>
          <span className="text-sm text-muted-foreground ml-2">— Configuração do Negócio</span>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === step ? 'bg-primary text-primary-foreground' :
                i < step ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check size={14} /> : <s.icon size={14} />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Business Info */}
        {step === 0 && (
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Informações do Negócio</h2>
              <p className="text-sm text-muted-foreground mt-1">Conte-nos sobre seu negócio para que clientes possam encontrá-lo.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do negócio *</Label>
                <Input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Ex: Barbearia Premium" />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <textarea value={bizDesc} onChange={e => setBizDesc(e.target.value)} placeholder="Descreva seu negócio em poucas palavras..." rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring resize-none text-sm" />
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <select value={bizCategory} onChange={e => setBizCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 outline-none focus:ring-2 focus:ring-ring text-sm">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <select value={bizCity} onChange={e => { setBizCity(e.target.value); setBizNeighborhood(''); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 outline-none focus:ring-2 focus:ring-ring text-sm">
                    <option value="">Selecione</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <select value={bizNeighborhood} onChange={e => setBizNeighborhood(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 outline-none focus:ring-2 focus:ring-ring text-sm" disabled={!bizCity}>
                    <option value="">Selecione</option>
                    {(NEIGHBORHOODS[bizCity] || []).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={bizAddress} onChange={e => setBizAddress(e.target.value)} placeholder="Rua, número, complemento" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!canProceedStep0} size="lg">
                Próximo <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Working Hours */}
        {step === 1 && (
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Horário de Funcionamento</h2>
              <p className="text-sm text-muted-foreground mt-1">Defina os dias e horários que você atende.</p>
            </div>

            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${h.isOpen ? 'bg-primary/5' : 'bg-muted/50'}`}>
                  <button onClick={() => toggleDay(i)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${h.isOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {h.isOpen ? <Check size={14} /> : ''}
                  </button>
                  <span className={`w-20 text-sm font-medium ${h.isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {DAYS[i]}
                  </span>
                  {h.isOpen ? (
                    <div className="flex items-center gap-2 text-sm">
                      <input type="time" value={h.openTime} onChange={e => updateHour(i, 'openTime', e.target.value)}
                        className="px-2 py-1 rounded-lg bg-secondary text-foreground border-0 outline-none text-sm" />
                      <span className="text-muted-foreground">até</span>
                      <input type="time" value={h.closeTime} onChange={e => updateHour(i, 'closeTime', e.target.value)}
                        className="px-2 py-1 rounded-lg bg-secondary text-foreground border-0 outline-none text-sm" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Fechado</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} size="lg">
                <ArrowLeft size={16} className="mr-1" /> Voltar
              </Button>
              <Button onClick={() => setStep(2)} size="lg">
                Próximo <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Seus Serviços</h2>
              <p className="text-sm text-muted-foreground mt-1">Adicione pelo menos um serviço para seus clientes agendarem.</p>
            </div>

            <div className="space-y-4">
              {services.map((s, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-4 space-y-3 relative">
                  {services.length > 1 && (
                    <button onClick={() => removeService(i)} className="absolute top-3 right-3 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome do serviço *</Label>
                      <Input value={s.name} onChange={e => updateService(i, 'name', e.target.value)} placeholder="Ex: Corte de cabelo" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Descrição</Label>
                      <Input value={s.description} onChange={e => updateService(i, 'description', e.target.value)} placeholder="Breve descrição" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Preço (R$) *</Label>
                      <Input type="number" value={s.price} onChange={e => updateService(i, 'price', e.target.value)} placeholder="35.00" min="0" step="0.01" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duração (min)</Label>
                      <Input type="number" value={s.duration} onChange={e => updateService(i, 'duration', e.target.value)} placeholder="30" min="5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addService} className="w-full">
              <Plus size={16} className="mr-1" /> Adicionar outro serviço
            </Button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                <ArrowLeft size={16} className="mr-1" /> Voltar
              </Button>
              <Button onClick={handleFinish} disabled={!canFinish || saving} size="lg">
                {saving ? 'Salvando...' : 'Finalizar Configuração'} {!saving && <Check size={16} className="ml-1" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
