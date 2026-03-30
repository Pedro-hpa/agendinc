import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Plus, Trash2, Check, X, Loader2, BarChart3, Calendar, DollarSign, Clock, Ban, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useOwnerBusiness,
  useBusinessServices,
  useBusinessBookings,
  useBlockedTimes,
  useAddService,
  useUpdateService,
  useDeleteService,
  useUpdateBookingStatus,
  useAddBlockedTime,
  useRemoveBlockedTime,
  useUpdateWorkingHours,
} from '@/hooks/useBusinessData';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface WorkingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

const Dashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: business, isLoading: bizLoading } = useOwnerBusiness(user?.id);
  const businessId = business?.id;

  const { data: services = [] } = useBusinessServices(businessId);
  const { data: bookings = [] } = useBusinessBookings(businessId);
  const { data: blockedTimes = [] } = useBlockedTimes(businessId);

  const addServiceMut = useAddService(businessId || '');
  const updateServiceMut = useUpdateService(businessId || '');
  const deleteServiceMut = useDeleteService(businessId || '');
  const updateBookingMut = useUpdateBookingStatus(businessId || '');
  const addBlockedMut = useAddBlockedTime(businessId || '');
  const removeBlockedMut = useRemoveBlockedTime(businessId || '');
  const updateHoursMut = useUpdateWorkingHours(businessId || '');

  // Service form state
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('');
  const [newSvcDuration, setNewSvcDuration] = useState('30');

  // Edit service state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');

  // Blocked time form state
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('18:00');
  const [blockReason, setBlockReason] = useState('');

  // Working hours state
  const [hours, setHours] = useState<WorkingHour[] | null>(null);
  const [hoursEditing, setHoursEditing] = useState(false);

  // Booking filter
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Redirects (after all hooks)
  if (!authLoading && !user) { navigate('/auth'); return null; }
  if (!authLoading && role !== 'business_owner') { navigate('/'); return null; }
  if (!authLoading && !bizLoading && !business) { navigate('/onboarding'); return null; }

  if (authLoading || bizLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={32} /></div>
      </div>
    );
  }

  const workingHours: WorkingHour[] = hours || (business?.working_hours as unknown as WorkingHour[]) || [];

  const handleAddService = () => {
    if (!businessId || !newSvcName.trim() || !newSvcPrice) {
      toast.error('Preencha nome e preço do serviço.');
      return;
    }
    addServiceMut.mutate({
      businessId,
      name: newSvcName.trim(),
      description: newSvcDesc.trim(),
      price: parseFloat(newSvcPrice),
      durationMinutes: parseInt(newSvcDuration) || 30,
    });
    setNewSvcName(''); setNewSvcDesc(''); setNewSvcPrice(''); setNewSvcDuration('30');
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditDesc(s.description);
    setEditPrice(String(s.price));
    setEditDuration(String(s.duration_minutes));
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateServiceMut.mutate({
      id: editingId,
      name: editName.trim(),
      description: editDesc.trim(),
      price: parseFloat(editPrice),
      durationMinutes: parseInt(editDuration) || 30,
    });
    setEditingId(null);
  };

  const handleAddBlock = () => {
    if (!businessId || !blockDate || !blockStart || !blockEnd) {
      toast.error('Preencha todos os campos.');
      return;
    }
    addBlockedMut.mutate({
      businessId,
      date: blockDate,
      startTime: blockStart,
      endTime: blockEnd,
      reason: blockReason,
    });
    setBlockDate(''); setBlockReason('');
  };

  const handleSaveHours = () => {
    if (!businessId) return;
    updateHoursMut.mutate(workingHours);
    setHoursEditing(false);
  };

  const toggleDay = (idx: number) => {
    const updated = [...workingHours];
    updated[idx] = { ...updated[idx], isOpen: !updated[idx].isOpen };
    setHours(updated);
    if (!hoursEditing) setHoursEditing(true);
  };

  const updateHour = (idx: number, field: 'openTime' | 'closeTime', val: string) => {
    const updated = [...workingHours];
    updated[idx] = { ...updated[idx], [field]: val };
    setHours(updated);
    if (!hoursEditing) setHoursEditing(true);
  };

  // Metrics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'completed').length;
  const estimatedRevenue = bookings
    .filter((b: any) => b.status !== 'cancelled')
    .reduce((sum: number, b: any) => sum + (Number(b.services?.price) || 0), 0);
  const upcomingBookings = bookings.filter((b: any) => b.status !== 'cancelled' && b.date >= new Date().toISOString().split('T')[0]).length;

  // Filtered bookings
  const filteredBookings = bookings.filter((b: any) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (dateFilter && b.date !== dateFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{business?.name}</h1>
          <p className="text-muted-foreground text-sm">Painel de gerenciamento</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: 'Agendamentos', value: totalBookings },
            { icon: BarChart3, label: 'Confirmados', value: confirmedBookings },
            { icon: Calendar, label: 'Próximos', value: upcomingBookings },
            { icon: DollarSign, label: 'Receita est.', value: `R$ ${estimatedRevenue.toFixed(2)}` },
          ].map((m, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
              <m.icon className="text-primary shrink-0" size={22} />
              <div>
                <p className="text-xl font-bold text-card-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="blocked">Bloqueios</TabsTrigger>
          </TabsList>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <Label className="text-xs">Status</Label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="block mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border-0">
                  <option value="all">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Data</Label>
                <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="mt-1" />
              </div>
              {(statusFilter !== 'all' || dateFilter) && (
                <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setDateFilter(''); }}>Limpar</Button>
              )}
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">Nenhum agendamento encontrado.</p>
            ) : (
              filteredBookings.map((bk: any) => (
                <div key={bk.id} className="bg-card rounded-xl p-4 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">{bk.customer_name || 'Cliente'}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      bk.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                      bk.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      bk.status === 'completed' ? 'bg-primary/20 text-primary' :
                      'bg-accent text-accent-foreground'
                    }`}>
                      {bk.status === 'pending' ? 'Pendente' : bk.status === 'confirmed' ? 'Confirmado' : bk.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{bk.services?.name || 'Serviço'} · R$ {Number(bk.services?.price || 0).toFixed(2)}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📅 {bk.date}</span>
                    <span>🕐 {String(bk.time).substring(0, 5)}</span>
                    {bk.customer_phone && <span>📞 {bk.customer_phone}</span>}
                  </div>
                  {bk.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => updateBookingMut.mutate({ bookingId: bk.id, status: 'confirmed' })}>
                        <Check size={14} className="mr-1" /> Confirmar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateBookingMut.mutate({ bookingId: bk.id, status: 'cancelled' })}>
                        <X size={14} className="mr-1" /> Recusar
                      </Button>
                    </div>
                  )}
                  {bk.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => updateBookingMut.mutate({ bookingId: bk.id, status: 'completed' })}>
                      <Check size={14} className="mr-1" /> Marcar Concluído
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* SERVICES TAB */}
          <TabsContent value="services" className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <h3 className="font-medium text-card-foreground flex items-center gap-2"><Plus size={16} /> Novo Serviço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={newSvcName} onChange={e => setNewSvcName(e.target.value)} placeholder="Nome do serviço" />
                <Input value={newSvcDesc} onChange={e => setNewSvcDesc(e.target.value)} placeholder="Descrição (opcional)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={newSvcPrice} onChange={e => setNewSvcPrice(e.target.value)} placeholder="Preço (R$)" />
                <Input type="number" value={newSvcDuration} onChange={e => setNewSvcDuration(e.target.value)} placeholder="Duração (min)" />
              </div>
              <Button onClick={handleAddService} disabled={addServiceMut.isPending}>Adicionar</Button>
            </div>

            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
            ) : (
              services.map((s: any) => (
                <div key={s.id} className="bg-card rounded-xl p-4 border border-border">
                  {editingId === s.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome" />
                        <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descrição" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Preço" />
                        <Input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="Duração (min)" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} disabled={updateServiceMut.isPending}>
                          <Save size={14} className="mr-1" /> Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-card-foreground">{s.name}</h4>
                        {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                        <p className="text-sm text-muted-foreground">R$ {Number(s.price).toFixed(2)} · {s.duration_minutes} min</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(s)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteServiceMut.mutate(s.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* WORKING HOURS TAB */}
          <TabsContent value="hours" className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              {workingHours.map((h, i) => (
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
              {hoursEditing && (
                <Button onClick={handleSaveHours} disabled={updateHoursMut.isPending}>
                  <Save size={14} className="mr-1" /> Salvar Horários
                </Button>
              )}
            </div>
          </TabsContent>

          {/* BLOCKED TIMES TAB */}
          <TabsContent value="blocked" className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-3">
              <h3 className="font-medium text-card-foreground flex items-center gap-2"><Ban size={16} /> Bloquear Horário</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Data</Label>
                  <Input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Início</Label>
                  <Input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim</Label>
                  <Input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} />
                </div>
              </div>
              <Input value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Motivo (opcional)" />
              <Button onClick={handleAddBlock} disabled={addBlockedMut.isPending}>Bloquear</Button>
            </div>

            {(blockedTimes as any[]).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum horário bloqueado.</p>
            ) : (
              (blockedTimes as any[]).map((bt: any) => (
                <div key={bt.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  <div>
                    <p className="font-medium text-card-foreground">📅 {bt.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {String(bt.start_time).substring(0, 5)} - {String(bt.end_time).substring(0, 5)}
                      {bt.reason && ` · ${bt.reason}`}
                    </p>
                  </div>
                  <button onClick={() => removeBlockedMut.mutate(bt.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
