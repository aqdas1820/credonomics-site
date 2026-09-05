import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | CredoNomics Mutual Fund Intelligence",
    default: "CredoNomics Mutual Fund Intelligence",
  },
  description: "Explore CredoNomics mutual-fund portfolio intelligence, scheme holdings, and research workflows.",
};

export default function MutualFundsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mf-domain-layout">
      {children}
    </div>
  );
}
