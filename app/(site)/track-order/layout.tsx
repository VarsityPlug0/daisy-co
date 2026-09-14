import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your Bevanssons order in real time. Enter your order reference number to see the current status and delivery updates.",
  alternates: { canonical: "https://gadgets.bevanssons.store/track-order" },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
