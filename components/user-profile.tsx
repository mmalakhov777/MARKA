"use client";

import { useWalletAuth } from "@/lib/wallet-auth";
import { User, Crown, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTonConnectUI } from "@tonconnect/ui-react";

export function UserProfile() {
  const { user, isLoading, isGuest, hasTelegram, error } = useWalletAuth();
  const [tonConnectUI] = useTonConnectUI();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-app-foreground/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-app-foreground/60">
        Not connected
      </div>
    );
  }

  // Guest user
  if (isGuest) {
    return (
      <button 
        onClick={() => tonConnectUI.openModal()}
        className="group flex items-center gap-3 transition-all hover:opacity-70 cursor-pointer"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
          <User className="h-4 w-4 text-neutral-600" />
        </div>
        
        <div className="flex flex-1 flex-col text-left">
          <span className="text-sm font-medium text-neutral-900">
            Guest User
          </span>
          <span className="text-xs text-neutral-500">
            Connect wallet to continue
          </span>
        </div>
      </button>
    );
  }

  // User with Telegram
  if (hasTelegram && user.telegram) {
    return (
      <Link 
        href="/profile"
        className="group flex items-center gap-3 transition-all hover:opacity-70"
      >
        <div className="relative">
          {user.telegram.photoUrl ? (
            <Image
              src={user.telegram.photoUrl}
              alt={user.telegram.firstName || "User"}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
              <User className="h-4 w-4 text-neutral-600" />
            </div>
          )}
        </div>
        
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-neutral-900">
              {user.telegram.firstName} {user.telegram.lastName}
            </span>
            {user.telegram.isPremium && (
              <span title="Telegram Premium">
                <Crown className="h-3 w-3 text-amber-500" />
              </span>
            )}
          </div>
          {user.telegram.username && (
            <span className="text-xs text-neutral-500">
              @{user.telegram.username}
            </span>
          )}
        </div>
      </Link>
    );
  }

  // User with only wallet
  return (
    <Link 
      href="/profile"
      className="group flex items-center gap-3 transition-all hover:opacity-70"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
        <Wallet className="h-4 w-4 text-neutral-600" />
      </div>
      
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-neutral-900">
          Wallet User
        </span>
        <span className="font-mono text-xs text-neutral-500">
          {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
        </span>
      </div>
    </Link>
  );
}


