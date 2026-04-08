import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { searchListings } from "@/data/store";
import { ListingCard } from "@/components/ListingCard";

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  const results = useMemo(() => searchListings(query), [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>›</span>
          <span className="text-foreground">Busca</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold mb-2">
          Resultados para "<span className="text-primary">{query}</span>"
        </h1>
        <p className="text-muted-foreground mb-8">{results.length} anúncio(s) encontrado(s)</p>

        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">Nenhum resultado encontrado.</p>
            <p className="text-sm text-muted-foreground">Tente buscar por outro termo ou <Link to="/categorias" className="text-primary hover:underline">navegue pelas categorias</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ListingCard listing={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
