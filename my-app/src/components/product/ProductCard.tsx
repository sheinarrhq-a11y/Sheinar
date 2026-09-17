import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { type Product } from "@/data/products";
import { useUser } from "@/context/UserContext";
import { LazyImage } from "@/components/ui/LazyImage";
import { useCurrency } from "@/context/CurrencyContext";

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { wishlist, toggleWishlist } = useUser();
  const { format } = useCurrency();
  const liked = wishlist.includes(p.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.08 }}
    >
      <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
        <div className="relative overflow-hidden bg-muted aspect-[3/4]">
          <LazyImage src={p.image} alt={p.title} wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
            aria-label="Wishlist"
            className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center bg-secondary/90 backdrop-blur transition-colors hover:bg-secondary sm:top-4 sm:right-4 sm:h-9 sm:w-9"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-accent text-accent" : "text-foreground"}`} />
          </button>
          {p.status === "sold-out" && (
            <span className="absolute bottom-2 left-2 bg-foreground px-2 py-1 text-[9px] uppercase tracking-[2px] text-secondary sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[3px]">Sold</span>
          )}
          {p.status === "preorder" && (
            <span className="absolute bottom-2 left-2 bg-accent px-2 py-1 text-[9px] uppercase tracking-[2px] text-accent-foreground sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[3px]">Pre-Order</span>
          )}
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <span className="text-[8px] uppercase tracking-[1.5px] text-mocha sm:text-[10px] sm:tracking-[3px]">{p.collection}</span>
          <h3 className="mt-1 line-clamp-2 font-serif text-sm text-foreground transition-colors group-hover:text-accent sm:mt-2 sm:text-lg">{p.title}</h3>
          <p className="mt-1 font-serif text-sm text-mocha sm:text-base">{format(p.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
