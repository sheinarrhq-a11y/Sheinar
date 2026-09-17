import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { WhatsAppFloat } from "@/components/common/WhatsAppFloat";
import { CartDrawer } from "@/components/common/CartDrawer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </>
  );
}
