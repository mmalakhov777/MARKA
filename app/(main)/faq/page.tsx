"use client";

import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

type FAQItem = {
  question: string;
  answer: string | string[];
};

const faqs: FAQItem[] = [
  {
    question: "What exactly does this service do?",
    answer: [
      "We provide a tool for creators to publicly commit to marking their content on the blockchain. Here's how:",
      "1. You announce your TON wallet address on your verified social media accounts",
      "2. You register your content from that wallet on our blockchain registry",
      "3. Your audience can verify that content came from your announced wallet",
      "4. Content without your wallet registration = not verified by you"
    ]
  },
  {
    question: "Do you verify that I own my content?",
    answer: "No. We don't claim to verify ownership. You verify yourself by publicly announcing your wallet on your social media. We just provide the tool to register content on blockchain. The verification comes from YOUR public commitment, not from us."
  },
  {
    question: "Why should I NOT trust you?",
    answer: [
      "Because you shouldn't have to! That's the whole point:",
      "• Our database can be hacked, manipulated, or shut down",
      "• Blockchain is trustless - your proofs exist independently of us",
      "• Your wallet = your cryptographic key. Only you control it",
      "• Even if we disappear, your blockchain registrations remain forever",
      "We're just infrastructure. Trust the blockchain, not us."
    ]
  },
  {
    question: "How does the watermark system work?",
    answer: [
      "The watermark is how you make verification visible:",
      "1. Generate a watermark with your wallet address + QR code",
      "2. Add it to your content (images, videos, etc.)",
      "3. Post the watermarked content across multiple platforms",
      "4. Anyone can see: wallet address or scan QR to verify",
      "5. Content without your watermark = suspicious",
      "The watermark is visible proof, not hidden verification."
    ]
  },
  {
    question: "Does this prove I created the content?",
    answer: "No. Blockchain only proves WHO registered WHEN. It doesn't prove you created it. What it does: proves you registered this content from your publicly announced wallet at a specific time. This is useful for forward-looking protection, not retroactive ownership claims."
  },
  {
    question: "Can this stop deepfakes or AI impersonation?",
    answer: [
      "Partially. Here's what it helps with:",
      "✅ If you consistently mark your content, absence of your watermark is suspicious",
      "✅ Scammers can't register from your wallet (they don't have your keys)",
      "✅ Your audience can check if content matches your announced wallet",
      "❌ It doesn't prevent deepfakes from being created",
      "❌ People who don't check will still fall for scams",
      "❌ It requires audience education and discipline",
      "It's a tool for verification, not a magic solution."
    ]
  },
  {
    question: "Why use TON blockchain specifically?",
    answer: [
      "Several reasons:",
      "• Transaction comments can contain your proof hash (data + payment linked)",
      "• Fast and cheap transactions (~$0.05 per registration)",
      "• Public and verifiable by anyone",
      "• Integrated with Telegram (large creator audience)",
      "• We can launch quickly without company setup",
      "The payment itself becomes part of the proof trail."
    ]
  },
  {
    question: "What if someone steals my content and registers it first?",
    answer: "If they register before you make your public wallet announcement, there's no way to prove who's real using just blockchain. That's why: Register BEFORE publishing publicly, and announce your wallet on verified social accounts FIRST. The system works forward from your announcement date, not retroactively."
  },
  {
    question: "What if someone copies my watermark/QR code and puts it on fake content?",
    answer: [
      "They can copy the watermark, but verification will fail. Here's why:",
      "• Each piece of content generates a UNIQUE hash (cryptographic fingerprint)",
      "• The hash is calculated from the actual file content, not the watermark",
      "• Your blockchain registration links: wallet + specific content hash + timestamp",
      "• If they change even 1 pixel, the hash becomes completely different",
      "When someone verifies:",
      "1. They scan the QR or enter the wallet from the watermark",
      "2. They upload the content file to generate its hash",
      "3. The system checks: does this hash exist in your wallet's registrations?",
      "4. Fake content = different hash = verification fails",
      "The watermark is just the pointer. The hash is the actual proof."
    ]
  },
  {
    question: "How do I prove my wallet address is really mine?",
    answer: [
      "Post your wallet address publicly on your VERIFIED social accounts:",
      "• Twitter (blue check)",
      "• Instagram (verified)",
      "• YouTube (verified channel)",
      "• Multiple platforms = stronger proof",
      "Example: 'Starting [date], all my content will be registered from wallet: UQAbc123...'",
      "The social platforms do the identity verification. We just store registrations."
    ]
  },
  {
    question: "Is it safe to publicly expose my wallet address?",
    answer: [
      "Yes, it's completely safe. Here's why:",
      "• Wallet addresses are PUBLIC by design - they're meant to be shared",
      "• It's like your email address or bank account number - people need it to verify you",
      "• No one can steal funds or access your wallet just by knowing the address",
      "• Only your PRIVATE KEY controls the wallet (never share that!)",
      "Privacy considerations:",
      "• Anyone can see your transaction history on blockchain (it's public)",
      "• They can see how much TON you have in that wallet",
      "• If privacy matters: use a dedicated wallet just for content registration",
      "• Don't use your main savings wallet for public verification",
      "Common practice: Most crypto users publicly share addresses for payments/verification."
    ]
  },
  {
    question: "What happens if I lose my wallet keys?",
    answer: "Create a new wallet and announce the transition on your verified social accounts. Post: 'Old wallet: UQAbc... → New wallet: UQDef...' Your social verification remains the identity layer. The blockchain just stores registration history. You control the announcement, not us."
  },
  {
    question: "What if someone hacks ALL my social accounts and announces a different wallet?",
    answer: [
      "This is extremely unlikely but worth addressing:",
      "Why it's hard to pull off:",
      "• Hacking multiple verified accounts (Twitter, Instagram, YouTube) simultaneously is very difficult",
      "• Platforms have recovery mechanisms and security alerts",
      "• Your audience will notice sudden wallet changes without explanation",
      "What the blockchain shows:",
      "• Timeline of registrations from your original wallet still exists",
      "• Blockchain history can't be changed - it shows WHO registered WHEN",
      "• Community members may have archived your original announcements",
      "Recovery steps:",
      "1. Immediately contact platform support to recover accounts",
      "2. Post from recovered accounts explaining the breach",
      "3. Show blockchain history proving your original wallet was first",
      "4. Your audience can see the suspicious timing of the fake announcement",
      "Best protection: Use 2FA, security keys, and distribute announcements across multiple platforms. The more platforms you use, the harder this attack becomes."
    ]
  },
  {
    question: "Do you store my content or data?",
    answer: "No. We only store content hashes (cryptographic fingerprints) on the blockchain. Your actual files stay with you. A hash is a one-way function - we can't recreate your content from it. We're just a registry, not a storage service."
  },
  {
    question: "Who is this for?",
    answer: [
      "This works best for:",
      "✅ YouTubers, content creators with verified accounts",
      "✅ Those frequently targeted by impersonators",
      "✅ Creators who understand crypto/blockchain concepts",
      "✅ People who register BEFORE publishing (proactive)",
      "✅ Those willing to train their audience to verify",
      "Not ideal for:",
      "❌ Casual creators who forget to register",
      "❌ Those wanting retroactive ownership proof",
      "❌ People expecting 100% scam prevention",
      "❌ Those unwilling to use crypto wallets"
    ]
  },
  {
    question: "Is this legally recognized proof of ownership?",
    answer: "No. Blockchain registration is NOT legal proof of ownership or creation. It's ONE piece of evidence that can support a case, but you'll need: original files with metadata, work-in-progress documentation, contracts, witnesses, etc. Use this as part of your evidence package, not as sole proof."
  },
  {
    question: "What if my audience doesn't check the watermarks?",
    answer: [
      "Most won't. That's reality. But:",
      "• Even 10-20% checking = community detection of fakes",
      "• Engaged fans will check and alert others",
      "• Over time, absence of watermark = red flag",
      "• You're building verification culture in your community",
      "You're not trying to get 100% to check. You're creating a mechanism for those who care to verify."
    ]
  },
  {
    question: "How much does it cost?",
    answer: "Currently ~0.05 TON per proof registration (~$0.03-0.05 USD). This covers the blockchain transaction cost. We're exploring subscription models ($29-49/month) for unlimited registrations. Early users get beta pricing."
  },
  {
    question: "What's your role in all of this?",
    answer: [
      "We're just a tool provider:",
      "• We help you create blockchain transactions",
      "• We provide watermark generation",
      "• We display verification pages",
      "• We query the blockchain for registrations",
      "We DON'T:",
      "• Verify your identity (social media does)",
      "• Prove ownership (you prove via public commitment)",
      "• Take legal responsibility (you vouch for yourself)",
      "• Store or control your data",
      "Think of us as infrastructure, not authority."
    ]
  },
  {
    question: "Can I trust that you won't manipulate the blockchain?",
    answer: "You don't have to trust us - that's the point! The blockchain is public and permissionless. Anyone can verify registrations directly on TON blockchain explorers. We can't change, delete, or manipulate blockchain records. Even if we tried, it would be publicly visible and provable."
  },
  {
    question: "How is this different from Adobe Content Credentials or similar services?",
    answer: [
      "Key differences:",
      "Adobe: Centralized database you must trust",
      "Us: Decentralized blockchain, trustless",
      "Adobe: Metadata in files (can be stripped)",
      "Us: Visible watermarks + blockchain registry",
      "Adobe: Company controls verification",
      "Us: You control via your wallet + public commitment",
      "We're not claiming to be 'better' - we're different. Adobe is easier. We're more trustless."
    ]
  },
  {
    question: "What makes your wallet-based authentication unique?",
    answer: [
      "This is THE key difference from traditional services:",
      "Traditional services: Your account = their database entry",
      "• If their database is deleted, you lose access",
      "• If they go bankrupt, your account disappears",
      "• You rely on email/password they control",
      "Our service: Your wallet = your identity",
      "• Wallet connection stored in YOUR browser, not our servers",
      "• Even if we delete your account, you instantly get back in",
      "• Even if our entire database is wiped, reconnecting your wallet recreates your account",
      "• Your proofs live on blockchain forever, independent of our database",
      "Real example:",
      "1. Admin deletes your account from our database",
      "2. You open the app with your wallet still connected",
      "3. System sees: wallet connected + no database record",
      "4. Creates new account automatically with your wallet + Telegram data",
      "5. You're back in instantly with all blockchain proofs intact",
      "Why this matters:",
      "• Our database is NOT the source of truth - the blockchain is",
      "• We can't lock you out (you control the wallet keys)",
      "• We can't lose your proofs (they're on blockchain)",
      "• Even malicious actions by us can't erase your registrations",
      "This is what 'trustless' actually means - you don't need to trust us to maintain your access."
    ]
  },
  {
    question: "What happens if you shut down?",
    answer: "Your proofs remain! All registrations are on TON blockchain forever. Anyone can still verify them by checking the blockchain directly. We just provide a convenient interface. The blockchain is the source of truth, not our servers. That's why you shouldn't trust us - trust the blockchain."
  },
  {
    question: "Is this a crypto scam?",
    answer: [
      "No. Here's why:",
      "• We're not selling tokens or promising returns",
      "• We're not asking for investment",
      "• You pay only blockchain transaction fees",
      "• Your wallet = your control (we never hold your keys)",
      "• Everything is verifiable on public blockchain",
      "• We're honest about limitations (no false promises)",
      "If you're uncomfortable with crypto, this isn't for you. That's fine. We're building for those who value trustless verification."
    ]
  }
];

export default function FAQPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col pb-24">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30" />

      {/* Background Images */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-10">
        <Image 
          src="/Playground Model Comparison (92).png" 
          alt="Background" 
          width={200}
          height={200}
          className="absolute right-0 top-20 h-48 w-auto rotate-12"
          priority
        />
        <Image 
          src="/Playground Model Comparison (97).png" 
          alt="Background" 
          width={200}
          height={200}
          className="absolute bottom-32 left-0 h-40 w-auto -rotate-6"
          priority
        />
      </div>

      {/* Header */}
      <div className={`mx-auto w-full max-w-2xl px-6 pt-8 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold text-neutral-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-lg text-neutral-700">
            Everything you need to know about how this works
          </p>
        </div>
      </div>

      {/* Key Principle Card */}
      <div className={`mx-auto mb-8 w-full max-w-2xl px-6 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`} style={{ transitionDelay: '200ms' }}>
        <div className="paper-card letter-edge rounded-lg border-l-4 border-neutral-500/60 bg-amber-50/50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <span className="text-sm font-bold text-amber-700">💡</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Core Principle</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                We&apos;re not an authority claiming to verify your content. We&apos;re a tool that helps you make public commitments on blockchain. You verify yourself via your announced wallet. Your audience verifies by checking blockchain. We&apos;re just infrastructure - trust the blockchain, not us.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="mx-auto w-full max-w-2xl space-y-3 px-6">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`paper-card overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                animate ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
              style={{ transitionDelay: `${300 + index * 50}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-neutral-50"
              >
                <h3 className="text-base font-semibold text-neutral-900">
                  {faq.question}
                </h3>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0 text-neutral-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-neutral-400" />
                )}
              </button>
              
              {isOpen && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-4">
                  {Array.isArray(faq.answer) ? (
                    <div className="space-y-2">
                      {faq.answer.map((line, i) => (
                        <p key={i} className="text-sm leading-relaxed text-neutral-700">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-neutral-700">
                      {faq.answer}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className={`mx-auto mt-12 w-full max-w-2xl px-6 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`} style={{ transitionDelay: `${300 + faqs.length * 50}ms` }}>
        <div className="paper-card rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">
            Still Have Questions?
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            The best way to understand is to try it. Set up your wallet and register your first proof.
          </p>
          <button
            onClick={() => router.push("/")}
            className="letter-edge mt-6 rounded-lg bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

