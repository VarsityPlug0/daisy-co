import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import { CartProvider } from "@/components/CartContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="pt-[116px]">{children}</main>
      <Footer />
      <AIAssistant />
      <LeadCapturePopup />
    </CartProvider>
  );
}
