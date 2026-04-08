import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase rounded-full border border-primary/30 text-primary bg-primary/10">
            Marketplace Gamer #1 do Brasil
          </span>

          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="text-foreground">comprar e </span>
            <span className="text-primary text-glow">vender</span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            contas, jogos, gift cards, gold, itens digitais e muito mais!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/categorias">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 box-glow">
                Começar agora <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary font-semibold text-base px-8">
                Como funciona?
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
