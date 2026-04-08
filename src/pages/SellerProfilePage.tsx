import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, MoreHorizontal, Shield, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSellerById, getSellerListings, reviews as allReviews } from "@/data/store";
import { ListingCard } from "@/components/ListingCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SellerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const seller = getSellerById(id || "");
  const sellerListings = seller ? getSellerListings(seller.id) : [];
  const sellerReviews = allReviews.filter((r) => sellerListings.some((l) => l.id === r.listingId));
  const [reviewFilter, setReviewFilter] = useState("all");

  const filteredReviews = sellerReviews.filter((r) => {
    if (reviewFilter === "all") return true;
    return r.receivedAs === reviewFilter;
  });

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Perfil não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const positivePercent = seller.totalReviews > 0 ? Math.round((seller.positiveReviews / seller.totalReviews) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Profile Header Banner */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-8">
        <div className="container flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-3 border-primary flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-primary">{seller.avatar}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">{seller.name}</h1>
            {seller.verified && <Shield className="h-5 w-5 text-primary" />}
            {seller.online && (
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">ON</span>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Details */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-bold text-foreground text-center mb-4">Detalhes</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Desde:</span>
                  <span className="font-semibold text-foreground">{new Date(seller.memberSince).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Avaliações positivas:</span>
                  <span className="font-semibold text-foreground">{positivePercent}%</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Número de avaliações:</span>
                  <span className="font-semibold text-foreground">{seller.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último acesso:</span>
                  <span className="font-semibold text-foreground">{seller.lastAccess}</span>
                </div>
              </div>
            </div>

            {/* Verifications */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-bold text-foreground text-center mb-4">Verificações</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className={seller.emailVerified ? "text-green-400 font-semibold flex items-center gap-1" : "text-muted-foreground"}>
                    {seller.emailVerified && <CheckCircle className="h-3.5 w-3.5" />}
                    {seller.emailVerified ? "Verificado" : "Não Verificado"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className={seller.phoneVerified ? "text-green-400 font-semibold flex items-center gap-1" : "text-muted-foreground"}>
                    {seller.phoneVerified && <CheckCircle className="h-3.5 w-3.5" />}
                    {seller.phoneVerified ? "Verificado" : "Não Verificado"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Documentos:</span>
                  <span className={seller.docsVerified ? "text-green-400 font-semibold flex items-center gap-1" : "text-muted-foreground"}>
                    {seller.docsVerified && <CheckCircle className="h-3.5 w-3.5" />}
                    {seller.docsVerified ? "Verificado" : "Não Verificado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Report */}
            <button className="w-full text-sm text-destructive hover:underline flex items-center justify-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Denunciar
            </button>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3 space-y-8">
            {/* Reputation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Reputação do usuário</h2>
                <Select value={reviewFilter} onValueChange={setReviewFilter}>
                  <SelectTrigger className="w-44 bg-secondary border-border text-sm">
                    <SelectValue placeholder="Recebida como" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Ambos tipos</SelectItem>
                    <SelectItem value="comprador">Comprador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reputation Counters */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    <span className="font-heading text-2xl font-bold text-foreground">{seller.positiveReviews}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Positivas</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    <span className="font-heading text-2xl font-bold text-foreground">{seller.neutralReviews}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Neutras</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsDown className="h-5 w-5 text-destructive" />
                    <span className="font-heading text-2xl font-bold text-foreground">{seller.negativeReviews}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Negativas</p>
                </div>
              </div>

              {/* Reviews List */}
              <h3 className="font-heading font-bold text-foreground mb-4">Últimas avaliações recebidas</h3>
              {filteredReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação encontrada.</p>
              ) : (
                <div className="space-y-3">
                  {filteredReviews.map((r) => {
                    const relatedListing = sellerListings.find((l) => l.id === r.listingId);
                    return (
                      <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                        <p className="text-sm text-secondary-foreground mb-2">"{r.text}"</p>
                        {relatedListing && (
                          <Link to={`/anuncio/${relatedListing.id}`} className="text-sm text-primary hover:underline block mb-2">
                            - {relatedListing.title}
                          </Link>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>{r.time}</span>
                          <span>|</span>
                          <span>Recebida como <strong className="text-foreground">{r.receivedAs}</strong></span>
                          <span>|</span>
                          <span>Por <span className="text-primary">{r.user}</span></span>
                          <div className="ml-auto">
                            {r.type === "positive" && <ThumbsUp className="h-4 w-4 text-green-400" />}
                            {r.type === "neutral" && <MoreHorizontal className="h-4 w-4 text-muted-foreground" />}
                            {r.type === "negative" && <ThumbsDown className="h-4 w-4 text-destructive" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Active Listings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                Anúncios ativos de {seller.name}
              </h2>
              {sellerListings.length === 0 ? (
                <p className="text-muted-foreground text-sm">Este vendedor não possui anúncios ativos.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sellerListings.map((l, i) => (
                    <motion.div key={l.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <ListingCard listing={l} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerProfilePage;
