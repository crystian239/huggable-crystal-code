import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { games } from "@/data/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CreateListingPage = () => {
  const { isAuthenticated, setShowAuthModal, setAuthTab } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [gameId, setGameId] = useState("");
  const [category, setCategory] = useState("");

  const selectedGame = games.find((g) => g.id === gameId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Faça login para anunciar</h1>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para criar um anúncio.</p>
          <Button onClick={() => { setAuthTab("login"); setShowAuthModal(true); }} className="bg-primary text-primary-foreground">Entrar</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !gameId || !category) {
      toast.error("Preencha todos os campos.");
      return;
    }
    toast.success("Anúncio criado com sucesso!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>›</span>
          <span className="text-foreground">Anunciar</span>
        </nav>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl font-bold mb-8">Criar Anúncio</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Jogo / Plataforma</label>
              <Select value={gameId} onValueChange={(v) => { setGameId(v); setCategory(""); }}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione o jogo" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            {selectedGame && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Categoria</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedGame.subcategories.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Título do anúncio</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Conta Valorant Radiante com 50+ Skins"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                maxLength={100}
              />
              <span className="text-xs text-muted-foreground mt-1 block">{title.length}/100</span>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu produto com detalhes..."
                rows={5}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Preço (R$)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Image upload placeholder */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Imagens</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Clique ou arraste imagens aqui</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB (máx. 6 imagens)</p>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-6 box-glow">
              Publicar Anúncio
            </Button>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateListingPage;
