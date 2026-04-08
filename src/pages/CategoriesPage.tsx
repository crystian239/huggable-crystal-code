import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { games } from "@/data/store";

const CategoriesPage = () => {
  const [filter, setFilter] = useState("");

  const filtered = games.filter((g) => g.name.toLowerCase().includes(filter.toLowerCase()));

  // Group by type
  const gamesList = filtered.filter((g) => !["steam", "ps", "xbox"].includes(g.id));
  const platforms = filtered.filter((g) => ["steam", "ps", "xbox"].includes(g.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>›</span>
          <span className="text-foreground">Categorias</span>
        </nav>

        {/* Filter */}
        <div className="max-w-sm mb-8">
          <div className="flex items-center rounded-lg border border-border bg-secondary">
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtre aqui..."
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Games */}
        {gamesList.length > 0 && (
          <>
            <h2 className="font-heading text-2xl font-bold text-primary mb-6">Jogos</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-12">
              {gamesList.map((game, i) => (
                <motion.div key={game.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/categoria/${game.slug}`} className="group block text-center">
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4] mb-2">
                      <img src={game.image} alt={game.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 rounded-xl transition-all" />
                    </div>
                    <span className="text-xs font-medium text-secondary-foreground group-hover:text-primary transition-colors">{game.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <>
            <h2 className="font-heading text-2xl font-bold text-primary mb-6">Plataformas & Gift Cards</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {platforms.map((game, i) => (
                <motion.div key={game.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/categoria/${game.slug}`} className="group block text-center">
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4] mb-2">
                      <img src={game.image} alt={game.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 rounded-xl transition-all" />
                    </div>
                    <span className="text-xs font-medium text-secondary-foreground group-hover:text-primary transition-colors">{game.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
