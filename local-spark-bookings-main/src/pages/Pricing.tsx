import { Link } from 'react-router-dom';
import { CalendarCheck, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    desc: 'Perfeito para começar',
    cta: 'Começar Grátis',
    highlight: false,
    features: [
      'Até 1 negócio',
      'Até 5 serviços',
      'Até 30 agendamentos/mês',
      'Página no marketplace',
      'Avaliações de clientes',
    ],
  },
  {
    name: 'Profissional',
    price: 'R$ 49',
    period: '/mês',
    desc: 'Para profissionais em crescimento',
    cta: 'Assinar Agora',
    highlight: true,
    features: [
      'Até 3 negócios',
      'Serviços ilimitados',
      'Agendamentos ilimitados',
      'Painel de métricas avançado',
      'Notificações por email',
      'Suporte prioritário',
      'Sem marca AgendaÍ',
    ],
  },
  {
    name: 'Empresarial',
    price: 'R$ 149',
    period: '/mês',
    desc: 'Para redes e franquias',
    cta: 'Falar com Vendas',
    highlight: false,
    features: [
      'Negócios ilimitados',
      'Tudo do Profissional',
      'API de integração',
      'Relatórios personalizados',
      'Múltiplos funcionários',
      'Integração com pagamento',
      'Gerente de conta dedicado',
    ],
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CalendarCheck className="text-primary" size={28} />
            <span className="text-xl font-bold text-foreground">AgendaÍ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline">Marketplace</Link>
            <Link to="/auth">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Planos e Preços</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Escolha o plano ideal para o seu negócio. Comece grátis e cresça no seu ritmo.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border-2 transition-colors ${plan.highlight ? 'border-primary shadow-lg scale-[1.02]' : 'border-border'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'} size="lg">
                      {plan.cta} <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {[
              { q: 'Posso trocar de plano depois?', a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças entram em vigor no próximo ciclo de cobrança.' },
              { q: 'Preciso de cartão de crédito para começar?', a: 'Não! O plano Gratuito não exige cartão. Você só precisa de um email para criar sua conta.' },
              { q: 'Como funciona o período de teste?', a: 'O plano Gratuito é permanente. Para planos pagos, oferecemos 14 dias de teste sem cobrança.' },
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem multas ou contratos. Cancele quando quiser diretamente no painel.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="text-primary" size={20} />
            <span className="font-bold text-foreground">AgendaÍ</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 AgendaÍ. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
