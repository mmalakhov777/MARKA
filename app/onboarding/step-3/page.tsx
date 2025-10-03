"use client";

import { Wallet, ArrowRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import Image from "next/image";

export default function OnboardingStep3() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    setMounted(true);
    // Trigger animation after mount with slight delay for better UX
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = useCallback(() => {
    // Store onboarding completion in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true");
    }
    router.push("/");
  }, [router]);

  // Auto-skip if wallet is already connected
  useEffect(() => {
    if (wallet) {
      completeOnboarding();
    }
  }, [wallet, completeOnboarding]);

  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress indicator - Minimalist */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-6">
          <div className="flex gap-2">
            <div className="h-1 w-8 rounded-full bg-neutral-400" />
            <div className="h-1 w-8 rounded-full bg-neutral-400" />
            <div className="h-1 w-8 rounded-full bg-neutral-900" />
          </div>
        </div>
      </div>

      {/* Background - official paper */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30" />

      {/* Content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-20 pb-32">
        <div className="flex-1 space-y-6">
          {/* Title & Description */}
          <div className={`space-y-3 text-center transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`} style={{ transitionDelay: '300ms' }}>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-neutral-900">
              Don&apos;t Trust Us
            </h1>
            <p className="mx-auto max-w-sm text-base sm:text-lg leading-relaxed text-neutral-700">
              {wallet 
                ? "Wallet connected! Your proofs are now secured by blockchain, not by us."
                : "Trust the blockchain, not our servers. That&apos;s why you need your wallet."
              }
            </p>
          </div>

          {/* Wallet Status or Info */}
          {wallet ? (
            <div className={`paper-card letter-edge mx-auto mt-8 max-w-sm overflow-hidden rounded-sm border-2 border-neutral-300/60 bg-neutral-50/60 p-6 shadow-[0_3px_10px_rgba(0,0,0,0.08)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`} style={{ transitionDelay: '500ms' }}>
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-neutral-700" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Connected</span>
              </div>
              <p className="font-mono text-sm text-neutral-800">
                {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-8)}
              </p>
            </div>
          ) : (
            <>
              {/* Why Connect Card */}
              <div className={`paper-card letter-edge relative mx-auto mt-6 max-w-sm overflow-visible rounded-sm border-l-4 border-neutral-500/60 bg-neutral-50/40 p-4 sm:p-5 shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`} style={{ transitionDelay: '500ms' }}>
                {/* Circular stamp overlay - Hidden on small screens */}
                <div className="absolute -right-12 -top-12 h-32 w-32 hidden sm:block" style={{transform: 'rotate(15deg)'}}>
                  <Image 
                    src="/Playground Model Comparison (92).png" 
                    alt="Safe Connection Stamp" 
                    fill 
                    className="object-contain"
                    priority
                  />
                </div>
                
                <div className="mb-3 flex items-center gap-2 text-neutral-700">
                  <Info className="h-5 w-5" />
                  <h3 className="text-base font-semibold">Why NOT Trust Us?</h3>
                </div>
                <ul className="space-y-2 text-left text-sm text-neutral-600">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>We&apos;re humans. Our databases can be hacked, manipulated, or shut down</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>Blockchain is trustless - your proof exists independently of our service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>Your wallet = your cryptographic key. Only you control it, not us</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <span>Even if we disappear, your blockchain proofs remain verifiable forever</span>
                  </li>
                </ul>
              </div>

              {/* Connect Wallet Button */}
              <button
                onClick={handleConnectWallet}
                className={`letter-edge mx-auto mt-4 flex h-12 sm:h-14 w-full max-w-sm items-center justify-center gap-2 rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98] ${
                  animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{letterSpacing: '0.05em', transitionDelay: '700ms'}}
              >
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Connect TON Wallet</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#fffef9] via-[#fffef9]/95 to-transparent pb-6 sm:pb-8 pt-6">
        <div className="mx-auto max-w-md px-6">
          <button
            onClick={completeOnboarding}
            className={`letter-edge flex h-12 sm:h-14 w-full items-center justify-center rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98] ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{letterSpacing: '0.05em', transitionDelay: '900ms'}}
          >
            {wallet ? "Get Started" : "Skip for Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

