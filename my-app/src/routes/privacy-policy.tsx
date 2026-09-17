import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[900px] mx-auto pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-8">
          <div>
            <span className="lux-eyebrow">Legal</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2 text-foreground">Privacy Policy</h1>
            <div className="h-px bg-border my-8" />
          </div>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-2xl text-foreground mb-4">Your Privacy Matters to Us</h2>
            <p className="font-serif italic text-mocha leading-relaxed text-lg">
              Sheinar ("Company") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Information We Collect</h2>
            <ul className="space-y-3  text-[14px]">
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Personal Data:</strong> name, email address, phone number, postal address, payment information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Order Information:</strong> purchase history, preferences, appointment bookings</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Usage Data:</strong> how you interact with our website, device information, browsing patterns</span>
              </li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">How We Use Your Information</h2>
            <ul className="space-y-3  text-[14px]">
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">To process and fulfill your orders</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">To communicate about your purchases and appointments</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">To send newsletters and promotional updates (you can opt out anytime)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">To improve our products and services</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">To comply with legal obligations</span>
              </li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Data Security</h2>
            <p className="font-serif italic text-mocha leading-relaxed text-[14px]">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Your Rights</h2>
            <p className="font-serif italic text-mocha leading-relaxed mb-3 text-[14px]">
              You have the right to:
            </p>
            <ul className="space-y-3 text-[14px]">
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Access, update, or delete your personal data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Opt out of marketing communications</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Request a copy of your data in a portable format</span>
              </li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Contact Us</h2>
            <p className="font-serif italic text-mocha leading-relaxed alias text-[14px]">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at <strong>sheinarrhq@gmail.com</strong> or call <strong>+91 7719666903</strong>.
            </p>
          </motion.section>

          <div className="bg-muted p-6 text-sm">
            <p className="font-serif italic text-mocha">Last updated: May 2026. Sheinar reserves the right to update this Privacy Policy at any time.</p>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
