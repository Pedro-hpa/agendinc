import { Link } from 'react-router-dom';
import { CalendarCheck, Star, Users, Zap, Shield, BarChart3, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  { icon: CalendarCheck, title: 'Agendamento Online', desc: 'Seus clientes agendam 24h por dia, sem ligações ou mensagens.' },
  { icon: Users, title: 'Gestão de Clientes', desc: 'Acompanhe todos os seus clientes e histórico de atendimentos.' },
  { icon: BarChart3, title: 'Painel de Métricas', desc: 'Veja faturamento, agendamentos e avaliações em tempo real.' },
  { icon: Shield, title: 'Seguro e Confiável', desc: 'Seus dados protegidos com criptografia de ponta.' },
  { icon: Clock, title: 'Economia de Tempo', desc: 'Reduza faltas e organize sua agenda automaticamente.' },
  { icon: Star, title: 'Avaliações', desc: 'Receba avaliações e construa sua reputação online.' },
];

const STEPS = [
  { num: '1', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente em menos de 2 minutos.' },
  { num: '2', title: 'Configure seu negócio', desc: 'Adicione serviços, preços e horários de funcionamento.' },
  { num: '3', title: 'Receba agendamentos', desc: 'Compartilhe seu link e comece a receber clientes.' },
];

const TESTIMONIALS = [
  { name: 'Carlos Silva', role: 'Barbearia Premium', text: 'Reduzi minhas faltas em 60% desde que comecei a usar o AgendaÍ. Meus clientes adoram a praticidade.', rating: 5 },
  { name: 'Ana Oliveira', role: 'Studio de Unhas', text: 'Finalmente parei de perder tempo no WhatsApp organizando horários. O sistema faz tudo por mim!', rating: 5 },
  { name: 'Pedro Santos', role: 'Lava-Jato Express', text: 'Em 3 meses triplicamos nossos agendamentos. A melhor decisão que tomei para o meu negócio.', rating: 5 },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CalendarCheck className="text-primary" size={28} />
            <span className="text-xl font-bold text-foreground">AgendaÍ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Como Funciona</a>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Preços</Link>
            <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap size={14} /> Plataforma #1 para negócios locais
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Seu negócio <span className="text-primary">organizado</span> e seus clientes <span className="text-primary">satisfeitos</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A plataforma completa de agendamento online para barbearias, salões, manicures, lava-jatos e muito mais. Simples, rápida e profissional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-base px-8 py-6">
                  Começar Gratuitamente <ArrowRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="text-base px-8 py-6">
                  Explorar Marketplace
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">✓ Grátis para começar &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Pronto em 2 min</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Tudo que você precisa para crescer</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Ferramentas poderosas e simples de usar para gerenciar seu negócio local.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg">Comece em 3 passos simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">O que nossos clientes dizem</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={16} className="fill-star text-star" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Pronto para transformar seu negócio?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">Junte-se a centenas de profissionais que já usam o AgendaÍ.</p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-base px-8 py-6">
                Criar Conta Grátis <ArrowRight size={18} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="text-primary" size={20} />
              <span className="font-bold text-foreground">AgendaÍ</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Preços</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">Entrar</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 AgendaÍ. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
