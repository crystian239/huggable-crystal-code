import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/"><img src={logoImg} alt="EzGamer" className="h-7 mb-4" /></Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O melhor marketplace gamer do Brasil. Compre e venda com segurança.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categorias" className="hover:text-primary transition-colors">Categorias</Link></li>
              <li><Link to="/como-funciona" className="hover:text-primary transition-colors">Como funciona</Link></li>
              <li><Link to="/anunciar" className="hover:text-primary transition-colors">Anunciar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Central de ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Termos de uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 EzGamer. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Discord</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
