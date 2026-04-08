import { useState } from "react";
import { Search, ShoppingCart, Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import logoImg from "@/assets/logo.png";

const categories = [
  { name: "Contas", href: "/categorias" },
  { name: "Jogos", href: "/categorias" },
  { name: "Gift Cards", href: "/categorias" },
  { name: "Gold & Moedas", href: "/categorias" },
  { name: "Itens Digitais", href: "/categorias" },
  { name: "Skins", href: "/categorias" },
  { name: "Serviços", href: "/categorias" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { user, isAuthenticated, logout, setShowAuthModal, setAuthTab } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogin = () => {
    setAuthTab("login");
    setShowAuthModal(true);
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="container flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex-shrink-0">
          <img src={logoImg} alt="EzGamer" className="h-8 w-auto" />
        </Link>

        <form onSubmit={handleSearch} className={`hidden md:flex flex-1 max-w-xl relative transition-all ${searchFocused ? "scale-[1.02]" : ""}`}>
          <div className={`flex w-full items-center rounded-lg border transition-all ${searchFocused ? "border-primary box-glow" : "border-border"} bg-secondary`}>
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar anúncio, jogo ou categoria..."
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden lg:inline-flex mr-2 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded font-mono">P</kbd>
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1">
          <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
            <Link to="/categorias" className="flex items-center gap-1 px-3 py-2 text-sm text-secondary-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary">
              Categorias <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-1 w-48 glass-strong rounded-lg p-2 shadow-2xl"
                >
                  {categories.map((c) => (
                    <Link key={c.name} to={c.href} className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                      {c.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/blog" className="px-3 py-2 text-sm text-secondary-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary">Blog</Link>

          <Link to="/anunciar">
            <Button size="sm" className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Anunciar
            </Button>
          </Link>

          <button onClick={() => setCartOpen(true)} className="relative p-2 text-secondary-foreground hover:text-foreground transition-colors ml-1">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
              <button className="flex items-center gap-2 p-2 text-secondary-foreground hover:text-foreground transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{user?.avatar}</span>
                </div>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full right-0 mt-1 w-48 glass-strong rounded-lg p-2 shadow-2xl"
                  >
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link to="/perfil" className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                      Meu Perfil
                    </Link>
                    <Link to="/anunciar" className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                      Meus Anúncios
                    </Link>
                    <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary rounded-md transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={handleLogin} className="p-2 text-secondary-foreground hover:text-foreground transition-colors">
              <User className="h-5 w-5" />
            </button>
          )}
        </nav>

        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-strong border-t border-border"
          >
            <div className="container py-4 space-y-3">
              <form onSubmit={handleSearch} className="flex items-center rounded-lg border border-border bg-secondary">
                <Search className="ml-3 h-4 w-4 text-muted-foreground" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              </form>
              <Link to="/categorias" className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>Categorias</Link>
              <Link to="/blog" className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>Blog</Link>
              <Link to="/como-funciona" className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>Como Funciona</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/perfil" className="block px-3 py-2 text-sm text-secondary-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>Meu Perfil</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block px-3 py-2 text-sm text-destructive">Sair</button>
                </>
              ) : (
                <button onClick={() => { handleLogin(); setMobileOpen(false); }} className="block px-3 py-2 text-sm text-primary">Entrar / Cadastrar</button>
              )}
              <Link to="/anunciar" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">Anunciar</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
