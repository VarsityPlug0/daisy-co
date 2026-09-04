import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Get a Free Quote | Daisy & Co.",
  description: "Get a free solar or electronics quote from Daisy & Co. Contact us via email or our online form. We respond fast — nationwide South Africa.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
