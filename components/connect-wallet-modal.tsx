"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { Wallet, X, Lock } from "lucide-react";
import { useEffect } from "react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // e.g., "Proofs", "Social", "Profile"
}

export function ConnectWalletModal({ isOpen, onClose, feature }: ConnectWalletModalProps) {
  const [tonConnectUI] = useTonConnectUI();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConnect = () => {
    tonConnectUI.openModal();
    onClose();
  };

  const featureMessages: Record<string, { title: string; description: string; benefits: string[] }> = {
    Proofs: {
      title: "Access Your Proofs",
      description: "Connect your wallet to create and manage blockchain-verified proofs",
      benefits: [
        "Create proof-of-creation for your files",
        "View all your submitted proofs",
        "Track verification status",
        "Download proof certificates",
      ],
    },
    Social: {
      title: "Link Social Accounts",
      description: "Connect your wallet to verify and link your social media accounts",
      benefits: [
        "Verify Twitter, Instagram, and more",
        "Upgrade to Creator level",
        "Build your Web3 identity",
        "Get verified badge",
      ],
    },
    Profile: {
      title: "Access Your Profile",
      description: "Connect your wallet to view and manage your profile",
      benefits: [
        "View your account details",
        "Manage wallet connections",
        "Track your level and status",
        "Link Telegram account",
      ],
    },
  };

  const content = feature && featureMessages[feature] 
    ? featureMessages[feature]
    : {
        title: "Connect Wallet Required",
        description: "Connect your TON wallet to access this feature",
        benefits: ["Full access to all features", "Blockchain-verified proofs", "Secure authentication"],
      };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-neutral-900">
          {content.title}
        </h2>

        {/* Description */}
        <p className="mb-6 text-center text-sm text-neutral-600">
          {content.description}
        </p>

        {/* Benefits */}
        <div className="mb-6 space-y-2">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" />
              <p className="text-sm text-neutral-700">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Connect TON Wallet
        </button>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-neutral-500">
          Supports Tonkeeper, MyTonWallet, and more
        </p>
      </div>
    </div>
  );
}

