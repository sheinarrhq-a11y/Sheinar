import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProducts, type Product } from "@/data/products";

const SHOP_CATEGORIES = {
  sarees: { label: "Sarees", description: "Silks, zari and heirlooms made to be remembered." },
  sharara: { label: "Sharara", description: "Fluid occasion dressing with a little more movement." },
  lehenga: { label: "Lehenga", description: "Ceremonial silhouettes, finished by hand in our   ." },
  suits: { label: "Suits", description: "Refined sets for every considered celebration." },
} as const;

type ShopCategory = keyof typeof SHOP_CATEGORIES;
type SortKey = "curator" | "price-asc" | "price-desc";

function isShopCategory(value: string): value is ShopCategory {
  return value in SHOP_CATEGORIES;
}

export const Route = createFileRoute("/shop/$category")({
  loader: async ({ params }) => {
    if (!isShopCategory(params.category)) throw notFound();
    const products = await fetchProducts();
    return {
      category: params.category,
      products: products.filter((product) => product.shopCategory === params.category),
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="pt-44 pb-32 text-center px-6">
        <h1 className="lux-heading text-4xl mb-4">Shop category not found</h1>
        <Link to="/" className="lux-btn mt-6">Return Home</Link>
      </div>
    </SiteLayout>
  ),
  component: ShopCategoryPage,
});

function ShopCategoryPage() {
  const { category, products } = Route.useLoaderData();
  const details = SHOP_CATEGORIES[category];
  const [sort, setSort] = useState<SortKey>("curator");

  const sortedProducts = useMemo(() => {
    if (sort === "curator") return products;
    return [...products].sort((a, b) => sort === "price-asc" ? a.price - b.price : b.price - a.price);
  }, [products, sort]);

  return (
    <SiteLayout>
      <section className="pt-40 pb-12 md:pt-48 md:pb-16 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <span className="lux-eyebrow">Shop</span>
            <h1 className="lux-heading text-5xl md:text-6xl mt-4">{details.label}</h1>
            <p className="font-serif italic text-mocha mt-5 max-w-xl">{details.description}</p>
          </div>
          <label className="flex items-center gap-3 font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground">
            Sort
            <span className="relative">
              <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="appearance-none border border-border bg-transparent px-4 py-3 pr-9 text-foreground outline-none">
                <option value="curator">Curator's Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2" />
            </span>
          </label>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {sortedProducts.length === 0 ? (
          <div className="border border-border px-6 py-20 text-center">
            <h2 className="font-serif text-2xl text-foreground">This edit is being prepared</h2>
            <p className="font-serif italic text-mocha mt-3">Products assigned to {details.label} in the admin panel will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {sortedProducts.map((product: Product, index: number) => <ProductCard key={product.id} p={product} index={index} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
