import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Social Verification - Connect Accounts',
  description: 'Connect and verify your social media accounts to strengthen your content authentication. Link Twitter, Instagram, YouTube and more.',
  openGraph: {
    title: 'Social Verification - Marka',
    description: 'Connect your social media accounts for stronger content verification.',
    url: 'https://marka-proof.org/social',
  },
  robots: {
    index: false, // User-specific content, don't index
    follow: true,
  },
};

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

