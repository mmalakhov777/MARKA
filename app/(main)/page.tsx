"use client";

import { UploadForm } from "@/components/upload-form";
import { UserProfile } from "@/components/user-profile";
import { getDictionary } from "@/locales";
import { t } from "@/lib/i18n";
import { UserTypeBadge } from "@/components/user-type-badge";
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt";
import { useWalletAuth } from "@/lib/wallet-auth";
import { useEffect, useState } from "react";
import { enTranslations } from "@/locales/en";

export default function HomePage() {
  const { isGuest, hasWallet, isLoading } = useWalletAuth();
  const [dictionary, setDictionary] = useState<typeof enTranslations | null>(null);

  useEffect(() => {
    getDictionary().then(setDictionary);
  }, []);

  if (isLoading || !dictionary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      {/* User Profile - Minimal */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <UserProfile />
          {hasWallet && <UserTypeBadge />}
        </div>
      </div>

      {/* Show Connect Wallet for Guests */}
      {isGuest ? (
        <ConnectWalletPrompt />
      ) : (
        <>
          {/* Main Upload Section - Clean & Minimal */}
          <div className="paper-card rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
            {/* Simple header */}
            <div className="mb-6 text-center">
              <h1 className="font-heading text-2xl font-semibold text-neutral-900">
                {t(dictionary, "home.heading")}
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                {t(dictionary, "home.subtitle")}
              </p>
            </div>

            {/* Upload Form */}
            <UploadForm dictionary={dictionary} />
            
            {/* Onboarding Link */}
            <div className="mt-4 text-center">
              <a 
                href="/onboarding" 
                className="text-sm text-neutral-500 hover:text-teal-600 transition-colors"
              >
                See onboarding again
              </a>
            </div>
          </div>
        </>
      )}

      {/* Minimal feature strip */}
      <div className="flex items-center justify-center gap-6 text-center text-xs text-neutral-500">
        <span>Blockchain Verified</span>
        <span className="text-neutral-300">•</span>
        <span>Human Created</span>
        <span className="text-neutral-300">•</span>
        <span>Forever Yours</span>
      </div>
    </div>
  );
}

