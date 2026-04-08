import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Star, Shield, Calendar, Package, ThumbsUp, ThumbsDown, MoreHorizontal, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { user, isAuthenticated, setShowAuthModal, setAuthTab } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Faça login para ver seu perfil</h1>
          <Button onClick={() => { setAuthTab("login"); setShowAuthModal(true); }} className="bg-primary text-primary-foreground">Entrar</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Profile Banner */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-8">
        <div className="container flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-3 border-primary flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-primary">{user.avatar}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">{user.name}</h1>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">ON</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-bold text-foreground text-center mb-4">Detalhes</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Desde:</span>
                  <span className="font-semibold text-foreground">{new Date().toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Avaliações positivas:</span>
                  <span className="font-semibold text-foreground">100%</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Número de avaliações:</span>
                  <span className="font-semibold text-foreground">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último acesso:</span>
                  <span className="font-semibold text-foreground">agora</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-bold text-foreground text-center mb-4">Verificações</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="text-green-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Verificado
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="text-muted-foreground">Não Verificado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Documentos:</span>
                  <span className="text-muted-foreground">Não Verificado</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3 space-y-8">
            {/* Reputation */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">Reputação do usuário</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    <span className="font-heading text-2xl font-bold text-foreground">0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Positivas</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    <span className="font-heading text-2xl font-bold text-foreground">0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Neutras</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsDown className="h-5 w-5 text-destructive" />
                    <span className="font-heading text-2xl font-bold text-foreground">0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Negativas</p>
                </div>
              </div>

              <h3 className="font-heading font-bold text-foreground mb-4">Últimas avaliações recebidas</h3>
              <p className="text-sm text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
            </div>

            {/* Listings */}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">Meus Anúncios</h2>
              <p className="text-sm text-muted-foreground mb-4">Você ainda não possui anúncios ativos.</p>
              <Link to="/anunciar">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Criar Anúncio</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
