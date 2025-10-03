import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Getting Started - Onboarding',
  description: 'Get started with Marka. Connect your TON wallet, verify your social accounts, and start protecting your content on the blockchain.',
  openGraph: {
    title: 'Get Started - Marka',
    description: 'Connect your wallet and start protecting your content.',
    url: 'https://marka-proof.org/onboarding',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
