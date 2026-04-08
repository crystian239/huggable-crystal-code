import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const steps = [
  { num: 1, title: "Anuncie ou encontre", desc: "Você cria um anúncio para vender seu produto e o comprador encontra o produto desejado, tudo de forma muito fácil." },
  { num: 2, title: "Intermediação segura", desc: "A EzGamer faz a intermediação da venda, para que tudo ocorra com agilidade e segurança." },
  { num: 3, title: "Confirmação e pagamento", desc: "O Comprador confirma que recebeu o produto e nós liberamos o pagamento para o Vendedor." },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>›</span>
          <span className="text-foreground">Como funciona</span>
        </nav>

        <div className="max-w-3xl mx-auto text-center py-12">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold mb-16">
            Como funciona
          </motion.h1>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col md:flex-row items-center gap-8 text-left"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-4xl font-bold text-primary">{step.num}</span>
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.title}</h2>
                  <p className="text-secondary-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-20 rounded-xl border border-border bg-card p-8">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Estamos aqui por você</h2>
            <p className="text-secondary-foreground leading-relaxed mb-4">
              Provavelmente você já pensou em comprar ou vender uma Conta, Moedas Virtuais ou Itens de um Jogo Online, não é mesmo? O mercado digital precisa de plataformas que promovem o comércio online de forma segura e unificada.
            </p>
            <p className="text-secondary-foreground leading-relaxed">
              Nós somos apaixonados por tecnologia e games. Foi assim que nasceu a <strong className="text-primary">EzGamer</strong>. Criamos uma plataforma inovadora que promove maior visibilidade, tanto para o comprador encontrar e adquirir o produto desejado, quanto para o vendedor alavancar suas vendas e receber com segurança.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
