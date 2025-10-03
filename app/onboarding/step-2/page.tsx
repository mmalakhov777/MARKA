"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";

export default function OnboardingStep2() {
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
            <div className="h-1 w-8 rounded-full bg-neutral-400" />
            <div className="h-1 w-8 rounded-full bg-neutral-900" />
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

      {/* Content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-28">
        <div className="flex-1 space-y-8 text-center">
          {/* Title & Description */}
          <div className={`space-y-3 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`} style={{ transitionDelay: '300ms' }}>
            <h1 className="font-heading text-4xl font-bold text-neutral-900">
              How It Works
            </h1>
            <p className="mx-auto max-w-sm text-lg leading-relaxed text-neutral-700">
              Simple 3-step process to secure your files
            </p>
          </div>

          {/* Steps - Official document style */}
          <div className="mx-auto mt-8 max-w-sm space-y-3 pb-4">
            {/* Step 1 */}
            <div className={`paper-card letter-edge group relative overflow-hidden rounded-sm border-2 border-neutral-300/40 bg-neutral-50/60 p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
              animate ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`} style={{transitionDelay: '500ms'}}>
              <div className="absolute right-3 top-3 text-5xl font-bold text-neutral-200/40">1</div>
              <div className="relative flex items-start gap-4">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <Image 
                    src="/Playground Model Comparison (97).png" 
                    alt="Upload" 
                    fill 
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-base font-semibold text-neutral-900">Upload Your Content</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Upload any file you&apos;re going to publish anywhere on the web
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`paper-card letter-edge group relative overflow-hidden rounded-sm border-2 border-neutral-300/40 bg-neutral-50/60 p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
              animate ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`} style={{transitionDelay: '700ms'}}>
              <div className="absolute right-3 top-3 text-5xl font-bold text-neutral-200/40">2</div>
              <div className="relative flex items-start gap-4">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <Image 
                    src="/Playground Model Comparison (99).png" 
                    alt="Register Author" 
                    fill 
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-base font-semibold text-neutral-900">Register as Author</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Create immutable blockchain record proving you&apos;re the author. Get QR watermark
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`paper-card letter-edge group relative overflow-hidden rounded-sm border-2 border-neutral-300/40 bg-neutral-50/60 p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
              animate ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`} style={{transitionDelay: '900ms'}}>
              <div className="absolute right-3 top-3 text-5xl font-bold text-neutral-200/40">3</div>
              <div className="relative flex items-start gap-4">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <Image 
                    src="/Playground Model Comparison (100).png" 
                    alt="Verify Human" 
                    fill 
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-base font-semibold text-neutral-900">Verify Authorship</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Anyone can verify this was created by you, not AI. No proof = not yours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#fffef9] via-[#fffef9]/95 to-transparent pb-8 pt-6">
        <div className="mx-auto max-w-md space-y-3 px-6">
          <Link
            href="/onboarding/step-3"
            className={`letter-edge flex h-14 w-full items-center justify-center rounded-sm border-2 border-neutral-400/60 bg-neutral-800 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_3px_10px_rgba(0,0,0,0.15)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-neutral-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)] active:scale-[0.98] ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{letterSpacing: '0.05em', transitionDelay: '1100ms'}}
          >
            Continue
          </Link>
          <button 
            onClick={handleSkip} 
            className={`w-full text-center text-sm text-neutral-600 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-neutral-900 ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '1200ms' }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

