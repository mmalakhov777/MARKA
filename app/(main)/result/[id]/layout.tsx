import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Proof Result - Registration Confirmed',
  description: 'Your content has been registered on the TON blockchain. View transaction details, download QR code, and share your proof.',
  openGraph: {
    title: 'Proof Registered - Marka',
    description: 'Content successfully registered on blockchain.',
    url: 'https://marka-proof.org/result',
  },
};

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

