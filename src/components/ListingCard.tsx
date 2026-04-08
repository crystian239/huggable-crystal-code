import { Link } from "react-router-dom";
import { Star, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/data/store";

const tagColors: Record<string, string> = {
  "Destaque": "bg-primary/20 text-primary border-primary/30",
  "Popular": "bg-accent/20 text-accent border-accent/30",
  "Melhor preço": "bg-success/20 text-success border-success/30",
  "Oferta": "bg-warning/20 text-warning border-warning/30",
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/anuncio/${listing.id}`} className="group block rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img src={listing.images[0]} alt={listing.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        {listing.tag && (
          <Badge variant="outline" className={`absolute top-2 right-2 text-[10px] ${tagColors[listing.tag] || ""}`}>
            {listing.tag}
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-3 line-clamp-2 uppercase">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-border mb-3">
          <span className="font-heading text-lg font-bold text-primary">
            R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground truncate">{listing.seller.name}</span>
          {listing.seller.verified && <Shield className="h-3 w-3 text-primary flex-shrink-0" />}
          {listing.seller.totalReviews > 0 && (
            <span className="text-xs text-muted-foreground">({listing.seller.totalReviews})</span>
          )}
        </div>
      </div>
    </Link>
  );
}
