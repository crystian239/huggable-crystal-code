import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { games } from "@/data/store";

export function CategoriesSection() {
  const popular = games.slice(0, 7);

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">Categorias Populares</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {popular.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <Link to={`/categoria/${cat.slug}`} className="group relative block rounded-xl overflow-hidden aspect-[3/4] cursor-pointer">
                <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 rounded-xl transition-all duration-300 group-hover:box-glow" />
                <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-foreground font-heading">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/categorias" className="text-sm text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase font-semibold flex items-center gap-2">
            <span className="w-16 h-px bg-border" /> Ver todas categorias <span className="w-16 h-px bg-border" />
          </Link>
        </div>
      </div>
    </section>
  );
}
