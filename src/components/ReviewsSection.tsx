import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/store";

export function ReviewsSection() {
  const displayReviews = reviews.slice(0, 4);

  return (
    <section className="py-16">
      <div className="container">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">Avaliações Recentes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayReviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5 relative"
            >
              <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/20" />
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 text-warning fill-warning" />
                ))}
              </div>
              <p className="text-sm text-secondary-foreground mb-4 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.user}</p>
                  <p className="text-xs text-muted-foreground">{r.game}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{r.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
