import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[900px] mx-auto pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-8">
          <div>
            <span className="lux-eyebrow">Legal</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2 text-foreground">Accessibility</h1>
            <div className="h-px bg-border my-8" />
          </div>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-2xl text-foreground mb-4">Our Commitment to Accessibility</h2>
            <p className="font-serif italic text-mocha leading-relaxed">
              Sheinar is committed to ensuring that our website is accessible to all visitors, including those with disabilities. We strive to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Accessibility Features</h2>
            <ul className="space-y-2">
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Keyboard navigation support throughout the website</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Alt text for all images to support screen readers</span>
              </li>
              
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">High contrast text for improved readability</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Resizable text without loss of functionality</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Descriptive link labels and headings</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Video captions and audio descriptions where available</span>
              </li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Browser & Assistive Technology Support</h2>
            <p className="font-serif italic text-mocha leading-relaxed">
              Our website has been tested with popular screen readers and assistive technologies including NVDA, JAWS, and VoiceOver. We support modern browsers on desktop, tablet, and mobile devices.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Continuous Improvement</h2>
            <p className="font-serif italic text-mocha leading-relaxed">
              We regularly audit and test our website for accessibility issues. We are committed to fixing any barriers to access and welcome feedback from our visitors.
            </p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Technical Standards</h2>
            <ul className="space-y-2">
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Valid HTML and CSS markup</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Proper semantic structure for better navigation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">ARIA landmarks and roles for enhanced screen reader support</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">·</span>
                <span className="font-serif italic text-mocha">Fast loading times for better mobile experience</span>
              </li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <h2 className="font-serif text-lg text-foreground mb-3">Get Help</h2>
            <p className="font-serif italic text-mocha leading-relaxed mb-4">
              If you encounter any accessibility issues while browsing our website or need assistance, please reach out to us:
            </p>
            <div className="space-y-2">
              <p className="font-serif italic text-mocha"><strong>Email:</strong> sheinarrhq@gmail.com</p>
              <p className="font-serif italic text-mocha"><strong>Phone:</strong> +91 7719490036</p>
              <p className="font-serif italic text-mocha"><strong>Hours:</strong> Mon-Fri 06:00-22:00 IST, Sat 09:30-18:00 IST</p>
            </div>
          </motion.section>

          <div className="bg-muted p-6 text-sm">
            <p className="font-serif italic text-mocha">Last updated: May 2026. We are continuously working to improve the accessibility of our website.</p>
          </div>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
