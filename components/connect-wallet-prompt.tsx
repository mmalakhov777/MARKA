"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { Wallet } from "lucide-react";

export function ConnectWalletPrompt() {
  const [tonConnectUI] = useTonConnectUI();

  return (
    <div className="paper-card rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="mb-2 text-xl font-semibold text-neutral-900">
          Connect Your Wallet
        </h2>
        
        <p className="mb-6 text-sm text-neutral-600">
          Connect your TON wallet to start creating proofs and access all features
        </p>
        
        <button
          onClick={() => tonConnectUI.openModal()}
          className="rounded-lg bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Connect TON Wallet
        </button>
        
        <a 
          href="/onboarding" 
          className="mt-4 text-sm text-neutral-500 hover:text-teal-600 transition-colors"
        >
          See onboarding again
        </a>
      </div>
    </div>
  );
}

