import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { fetchProducts, type Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <section className="bg-secondary py-20 px-4 sm:py-28 sm:px-6 lg:px-12">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 sm:mb-14">
          <span className="lux-eyebrow">New Arrivals</span>
          <Link
            to="/collections/$slug"
            params={{ slug: "riwaayat-collection" }}
            className="lux-btn shrink-0 px-4 py-3 text-[10px] sm:px-6 sm:py-3.5 sm:text-xs"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-10">
          {products.slice(0, 4).map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
