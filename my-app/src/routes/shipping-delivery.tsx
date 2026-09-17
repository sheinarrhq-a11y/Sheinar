import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/shipping-delivery")({
  component: ShippingDeliveryPage,
});

function ShippingDeliveryPage() {
  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[900px] mx-auto pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="prose prose-invert max-w-none">
          <span className="lux-eyebrow">Information</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2 text-foreground">Shipping & Delivery</h1>
          <div className="h-px bg-border my-8" />

          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-4">Free Shipping in India</h2>
              <p className="font-serif italic text-mocha leading-relaxed mb-4 text-[14px]">
                Sheinar ships across India via BlueDart, DTDC, DHL, UBX or FedEx express services. A tracking number will be provided to track your shipment online.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-4">Delivery Timeline</h2>
              <ul className="space-y-3 text-[14px]">
                <li className="flex gap-3">
                  <span className="text-accent">·</span>
                  <span className="font-serif italic text-mocha">Deliveries within India take roughly 3–5 working days.</span>
                </li>
                {/* <li className="flex gap-3">
                  <span className="text-accent">·</span>
                  <span className="font-serif italic text-mocha">International deliveries take around 5–10 working days.</span>
                </li> */}
                <li className="flex gap-3">
                  <span className="text-accent">·</span>
                  <span className="font-serif italic text-mocha">Domestic shipping within India is complimentary.</span>
                </li>
                {/* <li className="flex gap-3">
                  <span className="text-accent">·</span>
                  <span className="font-serif italic text-mocha">International shipping is free for orders above ₹25,000.</span>
                </li> */}
              </ul>
            </div>

            {/* International Shipments — hidden
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-4">International Shipments</h2>
              <p className="font-serif italic text-mocha leading-relaxed mb-4 text-[14px]">
                All international shipments are sent as Delivery Duty Paid (DDP). Rest assured — all duties are included, with no extra fees upon delivery.
              </p>
              <p className="font-serif italic text-mocha leading-relaxed mb-4 text-[14px]">
                Delivery dates provided are estimates only. We will make reasonable efforts to deliver in accordance with such dates; however, we will not be liable for failure to deliver as estimated.
              </p>
            </div>
            */}

            <div className="bg-muted p-6">
              <p className="font-serif italic text-mocha leading-relaxed mb-4 text-[14px]">
                All our garments are packaged according to our standards and practices. Please contact us if you receive your order in a parcel that appears to have been tampered with or is in an unsealed condition.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
