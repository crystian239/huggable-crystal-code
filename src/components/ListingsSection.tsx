import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { listings } from "@/data/store";
import { ListingCard } from "@/components/ListingCard";

export function ListingsSection() {
  const featured = listings.filter((l) => l.tag === "Destaque").slice(0, 6);
  const popular = listings.filter((l) => l.tag === "Popular" || l.sales > 80).slice(0, 6);

  return (
    <>
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Em Destaque</h2>
            <Link to="/categorias" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <ListingCard listing={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Mais Populares</h2>
            <Link to="/categorias" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <ListingCard listing={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
