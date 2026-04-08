import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ListingsSection } from "@/components/ListingsSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { blogPosts, listings } from "@/data/store";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ListingCard } from "@/components/ListingCard";

const Index = () => {
  // "Outros anúncios" - listings without tags
  const otherListings = listings.filter((l) => !l.tag).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <ListingsSection />
      <ReviewsSection />

      {/* Blog preview */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Últimos Posts no Blog</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline">Ver mais artigos</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {blogPosts.slice(0, 4).map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/blog/${post.slug}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all">
                  <div className="aspect-video overflow-hidden">
                    <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary">{post.authorAvatar}</span>
                      </div>
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outros anúncios */}
      {otherListings.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8">Outros Anúncios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherListings.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <ListingCard listing={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
