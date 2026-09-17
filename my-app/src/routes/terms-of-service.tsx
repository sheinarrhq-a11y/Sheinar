import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[900px] mx-auto pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-8">
          <div>
            <span className="lux-eyebrow">Legal</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2 text-foreground">Terms and Conditions</h1>
            <div className="h-px bg-border my-8" />
          </div>

          {[
            {
              title: "1. Sale and Purchase of Goods",
              content: `Sheinar ("Seller") hereby agrees to sell, and You ("Buyer") hereby agree to purchase, goods as described on the checkout window and incorporated herein by this reference ("Goods") on the terms and conditions set forth in this Agreement.`,
            },
            {
              title: "2. Purchase Price",
              content: "Buyer agrees to pay the Purchase Price of the Goods as posted on this website. The total amount shall be payable in full by Buyer according to the payment due date stated at Checkout.",
            },
            {
              title: "3. Payment Terms",
              content: "In addition, Seller shall have the right to pursue any remedies available at law or as provided herein and shall be entitled to reimbursement from Buyer for Seller's costs of collection, including attorney fees, legal fees and costs and disbursements, if any.",
            },
            {
              title: "4. Delivery",
              content: "Unless otherwise agreed in writing, delivery shall be made in accordance with Seller's shipping policy in effect on the date of shipment. Delivery dates provided by Seller are estimates only. Seller will make reasonable efforts to deliver in accordance with such dates; however, Seller will not be liable for failure to deliver as estimated.",
            },
            {
              title: "5. Customs, Duties, and Taxes",
              content: "The recipient is responsible for assuring that the product can be lawfully imported to the destination country. Orders shipped to countries outside of India may be subject to import taxes and customs duties. All our shipments are currently sent as Delivery Duty Paid, meaning you do NOT need to pay any duty or taxes at the time of receiving your shipment.",
            },
            {
              title: "6. Disclaimer of Warranty",
              content: "Seller undertakes no responsibility for the quality of the Goods or that the Goods will be fit for any particular purpose for which Buyer may be buying the Goods, except as otherwise provided in this Agreement.",
            },
            {
              title: "7. Colour Disclaimer",
              content: "The colours of products you see on computer screen will vary slightly from those of the actual product. This is because of the difference in underlying technologies and fabric. Monitors that are not properly calibrated also add to the difference in colours.",
            },
            {
              title: "8. Price Disclaimer",
              content: "While sheinar.com makes every effort to ensure that the products are described and priced accurately, in the event that an item is deemed to be priced incorrectly, sheinar.com reserves the right to refuse the sale of that item.",
            },
            {
              title: "9. Force Majeure",
              content: "Seller shall not be held responsible for any failure of performance due to federal, provincial or municipal action, strike or other labour trouble, fire or other damage to the Goods or manufacturing facility, or any other cause, act of God, or contingency not subject to the reasonable control of Seller.",
            },
            {
              title: "10. General",
              content: "This Agreement shall be interpreted under the laws of India. In the event of a dispute, Buyer submits to the exclusive jurisdiction and venue of India and hereby waives any objection to such jurisdiction.",
            },
          ].map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <h2 className="font-serif text-lg text-foreground mb-3">{section.title}</h2>
              <p className="font-serif italic text-mocha leading-relaxed text-[14px]">{section.content}</p>
            </motion.section>
          ))}
        </motion.div>
      </div>
    </SiteLayout>
  );
}
