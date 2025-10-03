import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Verify Content Proof',
  description: 'Verify content authenticity on the TON blockchain. Check registration timestamp, wallet address, and proof status.',
  openGraph: {
    title: 'Verify Content - Marka',
    description: 'Verify content authenticity on the TON blockchain.',
    url: 'https://marka-proof.org/proof',
  },
};

export default function ProofLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

