import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CollectionGrid } from "@/components/home/CollectionGrid";
import { ProductShowcase } from "@/components/home/ProductShowcase";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Sheinar" },
      { name: "description", content: "Explore Sheinar collections — couture, sarees, lehengas and suits, made by hand in  ." },
    ],
  }),
  component: () => (
    <SiteLayout>
      {/* <section className="pt-44 pb-16 text-center px-6">
        <span className="lux-eyebrow">All Collections</span>
        <h1 className="lux-heading text-5xl md:text-6xl mt-4">An Anthology of Heritage</h1>
        <p className="font-serif italic text-mocha mt-6 max-w-2xl mx-auto">
          Each collection a chapter, each chapter a season in the   .
        </p>
      </section> */}
      <CollectionGrid />
      <ProductShowcase />
    </SiteLayout>
  ),
});
