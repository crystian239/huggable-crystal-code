import { motion } from "framer-motion";
import { Shield, Headphones, Gift, Zap } from "lucide-react";

const features = [
  { icon: Shield, title: "Compra Segura", desc: "Entrega garantida ou seu dinheiro de volta. 100% protegido." },
  { icon: Headphones, title: "Suporte 24h", desc: "Equipe pronta para te atender sempre que precisar." },
  { icon: Gift, title: "Recompensas", desc: "Seja recompensado pelas suas compras e vendas." },
  { icon: Zap, title: "Entrega Instantânea", desc: "Receba seus itens em segundos após a confirmação." },
];

export function TrustSection() {
  return (
    <section className="py-16 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
