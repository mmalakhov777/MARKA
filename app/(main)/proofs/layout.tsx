import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'My Proofs - Content Registry',
  description: 'View all your content registrations on the TON blockchain. Track your verified content with permanent, trustless proof of authenticity.',
  openGraph: {
    title: 'My Proofs - Marka',
    description: 'View your blockchain-verified content registrations.',
    url: 'https://marka-proof.org/proofs',
  },
  robots: {
    index: false, // User-specific content, don't index
    follow: true,
  },
};

export default function ProofsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

