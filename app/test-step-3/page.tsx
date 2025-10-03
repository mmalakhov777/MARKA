"use client";

import { Wallet, ArrowRight, Info, Send } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TestStep3() {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isInTWA, setIsInTWA] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if we're in Telegram Web App (not just if script is loaded)
    const tg = (window as Window & { Telegram?: { WebApp?: { initDataUnsafe?: { user?: unknown } } } }).Telegram?.WebApp;
    const inTWA = !!(tg && tg.initDataUnsafe && Object.keys(tg.initDataUnsafe).length > 0);
    setIsInTWA(inTWA);
    // Trigger animation after mount with slight delay for better UX
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

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
          {!isInTWA && (
            <a 
              href="https://t.me/marka_proof_bot/start" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              <span>Open in Telegram</span>
            </a>
          )}
        </div>
      </div>

      {/* Background - official paper */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30" />

      {/* Content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-28">
        <div className="flex-1 space-y-8">
          {/* Title & Description */}
          <div className={`space-y-3 text-center transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`} style={{ transitionDelay: '300ms' }}>
            <h1 className="font-heading text-4xl font-bold text-neutral-900">
              Don&apos;t Trust Us
            </h1>
            <p className="mx-auto max-w-sm text-lg leading-relaxed text-neutral-700">
              Trust the blockchain, not our servers. That&apos;s why you need your wallet.
            </p>
          </div>

          {/* Why Connect Card - NOT CONNECTED STATE */}
          <>
            {/* Why Connect Card */}
            <div className={`paper-card letter-edge relative mx-auto mt-8 max-w-sm overflow-visible rounded-sm border-l-4 border-neutral-500/60 bg-neutral-50/40 p-5 shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`} style={{ transitionDelay: '500ms' }}>
              {/* Circular stamp overlay */}
              <div className="absolute -right-12 -top-12 h-32 w-32" style={{transform: 'rotate(15deg)'}}>
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
              onClick={() => alert('This is a test page - wallet connection is disabled')}
              className={`letter-edge mx-auto mt-6 flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98] ${
                animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{letterSpacing: '0.05em', transitionDelay: '700ms'}}
            >
              <Wallet className="h-5 w-5" />
              <span>Connect TON Wallet</span>
            </button>
          </>
        </div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#fffef9] via-[#fffef9]/95 to-transparent pb-8 pt-6">
        <div className="mx-auto max-w-md px-6">
          <button
            onClick={() => alert('This is a test page')}
            className={`letter-edge flex h-14 w-full items-center justify-center rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98] ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{letterSpacing: '0.05em', transitionDelay: '900ms'}}
          >
            Skip for Now
          </button>
        </div>
      </div>

      {/* Test Page Indicator */}
      <div className="fixed bottom-4 left-4 z-50 rounded-sm bg-yellow-400/90 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-lg">
        TEST PAGE - Wallet Not Connected State
      </div>
    </div>
  );
}

