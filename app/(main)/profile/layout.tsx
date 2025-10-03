import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Profile - Account Settings',
  description: 'Manage your Marka account, connected wallet, and social media verifications. Control your content authentication identity.',
  openGraph: {
    title: 'Profile - Marka',
    description: 'Manage your blockchain authentication profile.',
    url: 'https://marka-proof.org/profile',
  },
  robots: {
    index: false, // User-specific content, don't index
    follow: true,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

