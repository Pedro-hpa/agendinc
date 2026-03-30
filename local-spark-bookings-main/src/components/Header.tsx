import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <CalendarCheck className="text-primary" size={28} />
          <span className="text-xl font-bold text-foreground">AgendaÍ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Preços
          </Link>
          {user && role === 'business_owner' && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Painel do Negócio
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User size={14} />
                {profile?.name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} className="mr-1" /> Sair
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')}>Entrar</Button>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pb-4 space-y-2">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-foreground">
            Início
          </Link>
          <Link to="/marketplace" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-foreground">
            Marketplace
          </Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-foreground">
            Preços
          </Link>
          {user && role === 'business_owner' && (
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-foreground">
              Painel do Negócio
            </Link>
          )}
          {user ? (
            <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="block py-2 text-sm font-medium text-destructive">
              Sair ({profile?.name || user.email})
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-primary">
              Entrar / Criar Conta
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
