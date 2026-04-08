import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { blogPosts } from "@/data/store";

const BlogPage = () => {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>›</span>
          <span className="text-foreground">Blog</span>
        </nav>

        {/* Featured */}
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <Link to={`/blog/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all">
              <div className="aspect-video md:aspect-auto overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors mb-4">{featured.title}</h2>
                <p className="text-secondary-foreground mb-4 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{featured.authorAvatar}</span>
                  </div>
                  <span className="font-medium text-foreground">{featured.author}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readTime} de leitura</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rest.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={`/blog/${post.slug}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all">
                <div className="aspect-video overflow-hidden">
                  <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary">{post.authorAvatar}</span>
                    </div>
                    <span className="font-medium text-foreground">{post.author}</span>
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

      <Footer />
    </div>
  );
};

export default BlogPage;
