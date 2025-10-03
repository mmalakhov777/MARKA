"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";

export default function OnboardingStep1() {
  const router = useRouter();
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

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true");
    }
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress indicator - Minimalist */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-6">
          <div className="flex gap-2">
            <div className="h-1 w-8 rounded-full bg-neutral-900" />
            <div className="h-1 w-8 rounded-full bg-neutral-300" />
            <div className="h-1 w-8 rounded-full bg-neutral-300" />
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

      {/* Background Images in Corners */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Top Left */}
        <Image 
          src="/Playground Model Comparison (85).png" 
          alt="Background" 
          width={250}
          height={350}
          className={`absolute -left-8 -top-8 h-64 w-auto rotate-[-15deg] transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animate ? 'translate-x-0 translate-y-0 opacity-20' : 'translate-x-[50vw] translate-y-[50vh] opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
          priority
        />
        {/* Top Right */}
        <Image 
          src="/Playground Model Comparison (87).png" 
          alt="Background" 
          width={250}
          height={350}
          className={`absolute -right-8 top-20 h-56 w-auto rotate-[12deg] transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animate ? 'translate-x-0 translate-y-0 opacity-15' : 'translate-x-[-50vw] translate-y-[30vh] opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
          priority
        />
        {/* Bottom Left */}
        <Image 
          src="/Playground Model Comparison (89).png" 
          alt="Background" 
          width={250}
          height={350}
          className={`absolute -bottom-8 left-4 h-60 w-auto rotate-[8deg] transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animate ? 'translate-x-0 translate-y-0 opacity-20' : 'translate-x-[40vw] translate-y-[-40vh] opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
          priority
        />
      </div>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-32 pt-24">
        {/* Logo & Title & Description */}
        <div className={`space-y-6 text-center transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '800ms' }}>
          {/* Logo */}
          <div className="flex justify-center">
            <Image 
              src="/marka-logo.webp" 
              alt="Marka Logo" 
              width={180}
              height={126}
              className="h-auto w-44"
              priority
            />
          </div>
          
          <h1 className="font-heading text-4xl font-bold text-neutral-900">
            Prove This Is<br />Really You
          </h1>
          <p className="mx-auto max-w-sm text-lg leading-relaxed text-neutral-700">
            Verify you actually created this content, not someone else using AI to impersonate you. Your authentic work, blockchain verified.
          </p>
        </div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#fffef9] via-[#fffef9]/95 to-transparent pb-8 pt-6">
        <div className="mx-auto max-w-md space-y-3 px-6">
          <Link
            href="/onboarding/step-2"
            className={`letter-edge flex h-14 w-full items-center justify-center rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98] ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{letterSpacing: '0.05em', transitionDelay: '1000ms'}}
          >
            Continue
          </Link>
          <button 
            onClick={handleSkip} 
            className={`w-full text-center text-sm text-neutral-600 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-neutral-900 ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '1100ms' }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

