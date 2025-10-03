import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Everything you need to know about Marka. Learn how blockchain content authentication works, how to protect your content, and why you shouldn\'t need to trust us.',
  openGraph: {
    title: 'FAQ - Marka Content Authentication',
    description: 'Learn how to use blockchain to verify your content authenticity. Answers to all your questions about wallet-based authentication and trustless verification.',
    url: 'https://marka-proof.org/faq',
  },
  twitter: {
    title: 'FAQ - Marka Content Authentication',
    description: 'Learn how to use blockchain to verify your content authenticity.',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

