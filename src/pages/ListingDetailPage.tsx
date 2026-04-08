import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Shield, ShoppingCart, MessageCircle, ChevronRight, CheckCircle, Share2, ChevronLeft, Maximize2, ThumbsUp, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getListingById, getRelatedListings, reviews } from "@/data/store";
import { ListingCard } from "@/components/ListingCard";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const listing = getListingById(id || "");
  const { addItem } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthTab } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const listingReviews = reviews.filter((r) => r.listingId === listing?.id);
  const related = listing ? getRelatedListings(listing) : [];

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Anúncio não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBuy = () => {
    if (!isAuthenticated) {
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    addItem(listing);
    toast.success("Adicionado ao carrinho!");
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    toast.info("Chat com vendedor em breve!");
  };

  const shareUrl = window.location.href;
  const shareTitle = listing.title;

  const shareLinks = [
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, color: "hover:text-green-500" },
    { name: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, color: "hover:text-blue-400" },
    { name: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, color: "hover:text-foreground" },
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: "hover:text-blue-600" },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const ezPoints = Math.floor(listing.price);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/categorias" className="hover:text-primary transition-colors">Jogos</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/categoria/${listing.gameName.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-primary transition-colors">{listing.gameName}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{listing.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative rounded-xl overflow-hidden border border-border group">
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full aspect-video object-cover cursor-pointer"
                  onClick={() => setFullscreen(true)}
                />
                <button
                  onClick={() => setFullscreen(true)}
                  className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-lg text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i ? "border-primary box-glow" : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title + Stats (mobile) */}
            <div className="lg:hidden">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">{listing.title}</h1>
              {listing.badge && (
                <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-primary/20 text-primary border border-primary/30 mb-3">
                  {listing.badge}
                </span>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>DISPONÍVEL <strong className="text-foreground">{listing.available}</strong></span>
                <span>VENDA <strong className="text-foreground">{listing.sales}</strong></span>
              </div>
              <p className="text-sm text-primary mb-4">
                ✨ Você ganha {ezPoints} EZ Points
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-heading text-3xl font-bold text-primary">
                  R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <Button onClick={handleBuy} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                  COMPRAR
                </Button>
              </div>
            </div>

            {/* Characteristics Table */}
            {listing.characteristics.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-heading text-lg font-bold text-foreground uppercase mb-4">Características</h2>
                <div className="border border-border rounded-lg overflow-hidden">
                  {listing.characteristics.map((c, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "bg-secondary/50" : "bg-card"}`}>
                      <div className="w-1/3 px-4 py-3 text-sm font-medium text-muted-foreground border-r border-border">{c.label}</div>
                      <div className="w-2/3 px-4 py-3 text-sm text-foreground">{c.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-bold text-foreground uppercase mb-4">Descrição do Anúncio</h2>
              <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-line">{listing.description}</div>

              {/* Share */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  CRIADO EM: {new Date(listing.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })} {" "}
                  {new Date(listing.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase">Compartilhar:</span>
                  {shareLinks.map((s) => (
                    <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={`text-muted-foreground ${s.color} transition-colors`} title={s.name}>
                      <Share2 className="h-4 w-4" />
                    </a>
                  ))}
                  <button onClick={handleCopyLink} className="text-muted-foreground hover:text-primary transition-colors" title="Copiar link">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Reviews */}
            {listingReviews.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-heading text-lg font-bold text-foreground uppercase mb-4">Avaliações</h2>
                <div className="space-y-4">
                  {listingReviews.map((r) => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, j) => (
                            <Star key={j} className="h-3 w-3 text-warning fill-warning" />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{r.user}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{r.time}</span>
                      </div>
                      <p className="text-sm text-secondary-foreground">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Related Listings */}
            {related.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="font-heading text-lg font-bold text-foreground uppercase mb-4">Anúncios Relacionados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {related.map((item) => (
                    <ListingCard key={item.id} listing={item} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-6 sticky top-24">
              {/* Title (desktop) */}
              <div className="hidden lg:block">
                <h1 className="font-heading text-xl font-bold text-foreground leading-tight mb-1">{listing.title}</h1>
                {listing.badge && (
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-primary/20 text-primary border border-primary/30 mb-3">
                    {listing.badge}
                  </span>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>DISPONÍVEL <strong className="text-foreground">{listing.available}</strong></span>
                  <span>VENDA <strong className="text-foreground">{listing.sales}</strong></span>
                </div>
                <p className="text-sm text-primary mb-4">
                  ✨ Você ganha {ezPoints} EZ Points
                </p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="font-heading text-3xl font-bold text-primary">
                  R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <Button onClick={handleBuy} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  COMPRAR
                </Button>
              </div>

              {/* Seller info */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-bold text-foreground text-center mb-3">Vendedor</h3>
                <Link to={`/perfil/${listing.seller.id}`} className="flex flex-col items-center group mb-3">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-primary">{listing.seller.avatar}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-primary group-hover:underline">{listing.seller.name}</span>
                    {listing.seller.verified && <Shield className="h-3.5 w-3.5 text-primary" />}
                    <span className="text-xs text-muted-foreground">({listing.seller.totalReviews})</span>
                    {listing.seller.online && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">ON</span>
                    )}
                  </div>
                </Link>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Membro desde:</span>
                    <span className="font-semibold text-foreground">{new Date(listing.seller.memberSince).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avaliações positivas:</span>
                    <span className="font-semibold text-foreground">
                      {listing.seller.totalReviews > 0 ? Math.round((listing.seller.positiveReviews / listing.seller.totalReviews) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Número de avaliações:</span>
                    <span className="font-semibold text-foreground">{listing.seller.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Último acesso:</span>
                    <span className="font-semibold text-foreground">{listing.seller.lastAccess}</span>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="border-t border-border mt-4 pt-4">
                <h3 className="text-sm font-bold text-foreground text-center mb-3">Verificações</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className={listing.seller.emailVerified ? "text-green-400 font-semibold" : "text-muted-foreground"}>
                      {listing.seller.emailVerified ? "✓ Verificado" : "Não Verificado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className={listing.seller.phoneVerified ? "text-green-400 font-semibold" : "text-muted-foreground"}>
                      {listing.seller.phoneVerified ? "✓ Verificado" : "Não Verificado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Documentos:</span>
                    <span className={listing.seller.docsVerified ? "text-green-400 font-semibold" : "text-muted-foreground"}>
                      {listing.seller.docsVerified ? "✓ Verificado" : "Não Verificado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Guarantee */}
              <div className="border-t border-border mt-4 pt-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="font-heading font-bold text-foreground">Entrega garantida</h3>
                  <p className="text-xs text-muted-foreground">Ou o seu dinheiro de volta ⓘ</p>
                </div>
              </div>

              {/* Contact button */}
              <div className="mt-4">
                <Button onClick={handleContact} variant="outline" className="w-full border-border text-foreground hover:bg-secondary text-sm">
                  <MessageCircle className="mr-2 h-4 w-4" /> Contatar vendedor
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen image modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button className="absolute top-4 right-4 text-foreground hover:text-primary p-2" onClick={() => setFullscreen(false)}>✕</button>
            <img src={listing.images[selectedImage]} alt={listing.title} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
            {listing.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? "border-primary" : "border-border opacity-60"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ListingDetailPage;
