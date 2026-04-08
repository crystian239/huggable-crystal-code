import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getGameBySlug, getListingsByGame, games } from "@/data/store";
import { ListingCard } from "@/components/ListingCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const GameCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const game = getGameBySlug(slug || "");
  const allListings = game ? getListingsByGame(game.id) : [];

  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const filtered = useMemo(() => {
    let result = [...allListings];
    if (selectedSub) result = result.filter((l) => l.category === selectedSub);
    if (minPrice) result = result.filter((l) => l.price >= Number(minPrice));
    if (maxPrice) result = result.filter((l) => l.price <= Number(maxPrice));

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "popular": result.sort((a, b) => b.sales - a.sales); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [allListings, selectedSub, minPrice, maxPrice, sortBy]);

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Categoria não encontrada</h1>
          <Link to="/categorias" className="text-primary hover:underline">Ver todas categorias</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>›</span>
          <Link to="/categorias" className="hover:text-primary transition-colors">Jogos</Link>
          <span>›</span>
          <span className="text-foreground">{game.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comprar e vender</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground uppercase">{game.name}</h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {/* Subcategories */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-heading font-bold text-foreground text-sm uppercase mb-3">Categorias</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedSub(null)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${!selectedSub ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                  >
                    Todos ({allListings.length})
                  </button>
                </li>
                {game.subcategories.map((sub) => {
                  const count = allListings.filter((l) => l.category === sub).length;
                  return (
                    <li key={sub}>
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${selectedSub === sub ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                      >
                        {sub} ({count})
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price filter */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-heading font-bold text-foreground text-sm uppercase mb-3">Filtros</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Preço mínimo:</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min."
                    className="w-full mt-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Preço máximo:</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Máx."
                    className="w-full mt-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {}}
                >
                  Aplicar filtro
                </Button>
              </div>
            </div>
          </aside>

          {/* Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{filtered.length} anúncio(s)</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-secondary border-border">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                  <SelectItem value="popular">Mais vendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum anúncio encontrado para os filtros selecionados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <ListingCard listing={item} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GameCategoryPage;
