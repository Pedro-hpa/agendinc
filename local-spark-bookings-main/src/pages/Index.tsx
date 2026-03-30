import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_ICONS, Category, CITIES, NEIGHBORHOODS } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BusinessCard from '@/components/BusinessCard';
import CategoryFilter from '@/components/CategoryFilter';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;

const Index = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      let query = supabase.from('businesses').select('*');
      if (category) query = query.eq('category', category);
      if (city) query = query.eq('city', city);
      if (neighborhood) query = query.eq('neighborhood', neighborhood);
      if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      
      const { data, error } = await query.order('average_rating', { ascending: false });
      if (!error && data) setBusinesses(data);
      setLoading(false);
    };
    fetchBusinesses();
  }, [search, category, city, neighborhood]);

  const neighborhoods = city ? NEIGHBORHOODS[city] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Agende serviços locais com facilidade
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Encontre barbearias, salões, manicures e muito mais perto de você.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg p-4 md:p-6 space-y-4 border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou serviço..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <select
                value={city}
                onChange={e => { setCity(e.target.value); setNeighborhood(''); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
              >
                <option value="">Todas as cidades</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {city && (
              <div className="flex-1">
                <select
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                >
                  <option value="">Todos os bairros</option>
                  {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
          </div>

          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {businesses.length} {businesses.length === 1 ? 'negócio encontrado' : 'negócios encontrados'}
              </h2>
            </div>

            {businesses.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Nenhum negócio encontrado.</p>
                <p className="text-sm mt-1">Tente ajustar seus filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map(b => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
