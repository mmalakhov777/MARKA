import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Creator Levels - Verification Tiers',
  description: 'Discover Marka creator levels and verification tiers. Build your reputation through social verification and content registrations.',
  openGraph: {
    title: 'Creator Levels - Marka',
    description: 'Explore verification tiers and build your creator reputation.',
    url: 'https://marka-proof.org/levels',
  },
};

export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

