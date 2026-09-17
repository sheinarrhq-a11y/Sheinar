import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/cookie-policy")({
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[900px] mx-auto pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-8">
          <div>
            <span className="lux-eyebrow">Legal</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2 text-foreground">Cookie Policy</h1>
            <div className="h-px bg-border my-8" />
          </div>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-2xl text-foreground mb-4">Understanding Cookies</h2>
            <p className="font-serif italic text-mocha leading-relaxed">
              Cookies are small text files stored on your device when you visit our website. They help us improve your experience and provide personalized content.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Types of Cookies We Use</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Essential Cookies:</strong> Required for the website to function properly, including session management and security</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Performance Cookies:</strong> Help us understand how visitors use our website and optimize performance</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Functional Cookies:</strong> Remember your preferences and settings for a better experience</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha"><strong>Marketing Cookies:</strong> Allow us to show relevant ads and track campaign effectiveness</span>
              </li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Managing Your Cookies</h2>
            <p className="font-serif italic text-mocha leading-relaxed mb-4">
              You can control cookie settings through your browser. Most browsers allow you to refuse cookies or alert you when cookies are being sent. You can also delete cookies from your device at any time.
            </p>
            <p className="font-serif italic text-mocha leading-relaxed">
              Please note that disabling certain cookies may affect the functionality of our website.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Third-Party Cookies</h2>
            <p className="font-serif italic text-mocha leading-relaxed">
              We may use third-party services (analytics providers, payment processors) that set their own cookies. These third parties have their own privacy policies and are responsible for their cookie practices.
            </p>
          </motion.section>

          <div className="bg-muted p-6">
            <p className="font-serif italic text-mocha text-sm">
              For more information about cookies or to update your preferences, please contact us at <strong>sheinarrhq@gmail.com</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}

