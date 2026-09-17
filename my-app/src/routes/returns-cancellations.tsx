import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/returns-cancellations")({
  component: ReturnsCancellationsPage,
});

function ReturnsCancellationsPage() {
  return (
<SiteLayout>
  <div className="pt-32 px-6 lg:px-12 max-w-[900px] mx-auto pb-24">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-12"
    >
      <div>
        <span className="lux-eyebrow">Information</span>

        <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2 text-foreground">
          Returns & Cancellations
        </h1>

        <div className="h-px bg-border my-8" />

        <p className="font-serif italic text-mocha text-lg md:text-2xl mt-8 max-w-3xl mx-auto leading-relaxed mb-8">
          Please read our cancellation, refund and credit policy carefully
          before placing your order.
        </p>
      </div>

      <section>
        <h2 className="font-serif text-2xl text-foreground mb-4">
          Cancellation, Refund & Credit Policy
        </h2>

        <ol className="space-y-4 text-[14px] list-decimal pl-5">
          <li className="font-serif italic text-mocha">
            Orders may be cancelled within 48 hours from the time the order
            is placed.
          </li>

          <li className="font-serif italic text-mocha">
            If an order is cancelled within 48 hours, the eligible amount may
            be refunded or provided as a credit note, as applicable.
          </li>

          <li className="font-serif italic text-mocha">
            Once 48 hours have passed from the time the order is placed, the
            order cannot be cancelled and no refund or credit note will be
            provided.
          </li>

          <li className="font-serif italic text-mocha">
            Any advance amount or token amount paid towards an order is
            non-refundable after the applicable 48-hour cancellation period
            has expired.
          </li>

          <li className="font-serif italic text-mocha">
            All orders are made specifically for the client. Therefore, we do
            not accept returns after the order has been placed or the outfit
            has been delivered.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-foreground mb-4">
          Need Help?
        </h2>

        <p className="font-serif italic text-mocha leading-relaxed">
          If you have any queries related to cancellation, refunds, credit
          notes, products or your order, kindly call or WhatsApp us at
          +91 6239315288.
        </p>
      </section>

      <div className="bg-muted p-6">
        <h3 className="font-serif text-lg text-foreground mb-3">
          Contact Information
        </h3>

        <p className="font-serif italic text-mocha text-sm leading-relaxed">
          Sheinar
          <br />
          Mohali
          <br />
          India
          <br />
          <br />
          For inquiries: sheinarrhq@gmail.com
        </p>
      </div>
    </motion.div>
  </div>
</SiteLayout>
  );
}
