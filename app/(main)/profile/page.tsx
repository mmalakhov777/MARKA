"use client";

import { useWalletAuth } from "@/lib/wallet-auth";
import { Crown, Globe, Wallet, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

export default function ProfilePage() {
  const { user, isLoading, isGuest, hasTelegram } = useWalletAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<string>("individual");
  
  // TON Connect hooks
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const [savedWalletAddress, setSavedWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isGuest) {
      router.push("/");
    }
  }, [isLoading, isGuest, router]);

  // Fetch saved wallet address and user type from database
  useEffect(() => {
    async function fetchUserData() {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user?id=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
          if (data.user?.wallet_address) {
            setSavedWalletAddress(data.user.wallet_address);
          }
          if (data.user?.user_type) {
            setUserType(data.user.user_type);
          }
        }
      } catch (error) {
        // Error fetching user data
      }
    }
    
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  // Wallet is already saved via /api/auth/wallet when user connects
  // Just sync the UI state
  useEffect(() => {
    if (tonAddress && user?.walletAddress) {
      setSavedWalletAddress(user.walletAddress);
    }
  }, [tonAddress, user?.walletAddress]);

  const handleDisconnectWallet = async () => {
    if (!user?.id) return;
    
    try {
      await tonConnectUI.disconnect();
      
      // Remove from database
      const response = await fetch(`/api/user/wallet?userId=${user.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setSavedWalletAddress(null);
      }
    } catch (error) {
      setWalletError("Failed to disconnect wallet");
    }
  };

  const handleLogout = async () => {
    try {
      // Disconnect TON wallet
      await tonConnectUI.disconnect();
      
      // Clear localStorage
      localStorage.removeItem("guest_user_id");
      localStorage.removeItem("onboarding_completed");
      
      // Redirect to home
      router.push("/");
    } catch (error) {
      // Error logging out
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isGuest || !user) {
    return null;
  }

  // Get display name and info
  const displayName = hasTelegram && user.telegram 
    ? `${user.telegram.firstName} ${user.telegram.lastName || ''}`
    : user.walletAddress.substring(0, 6) + '...' + user.walletAddress.substring(user.walletAddress.length - 4);

  const displayPhoto = hasTelegram ? user.telegram?.photoUrl : null;
  const displayUsername = hasTelegram ? user.telegram?.username : null;
  const isPremium = hasTelegram ? user.telegram?.isPremium : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Header - Minimal */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {displayPhoto ? (
            <Image
              src={displayPhoto}
              alt={displayName}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <Wallet className="h-7 w-7 text-neutral-600" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-neutral-900">
                {displayName}
              </h1>
              {isPremium && (
                <Crown className="h-4 w-4 text-amber-500" />
              )}
            </div>
            {displayUsername && (
              <p className="text-sm text-neutral-500">@{displayUsername}</p>
            )}
            <div className="mt-2 flex flex-col gap-1.5">
              <Link
                href="/levels"
                className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-70 ${
                  userType === 'creator' 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <Star className={`h-3 w-3 ${userType === 'creator' ? 'fill-white' : 'fill-neutral-400'}`} />
                <span>Level {userType === 'creator' ? '2' : '1'}</span>
              </Link>
              <span className="text-xs text-neutral-400">ID: {user.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Cards - Minimal */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Language Card */}
        {hasTelegram && user.telegram?.languageCode && (
          <div className="paper-card rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="text-xs text-neutral-500">Language</p>
                <p className="font-medium text-neutral-900">
                  {user.telegram.languageCode.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Level Card */}
        <Link href="/social" className="paper-card rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:bg-neutral-50 block">
          <div className="flex items-center gap-3">
            <Star className={`h-5 w-5 ${userType === 'creator' ? 'fill-neutral-700 text-neutral-700' : 'text-neutral-600'}`} />
            <div>
              <p className="text-xs text-neutral-500">Account Level</p>
              <p className="font-medium text-neutral-900">
                {userType === 'creator' ? 'Level 2 - Creator' : 'Level 1 - Individual'}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Permissions Section - Only show if Telegram linked */}
      {hasTelegram && user.telegram && (
        <div className="paper-card rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            Telegram Permissions
          </h2>
          
          <div className="space-y-2">
            {user.telegram.allowsWriteToPm !== undefined && (
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Direct Messages</p>
                  <p className="text-xs text-neutral-500">Bot messages</p>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.telegram.allowsWriteToPm 
                    ? "bg-neutral-100 text-neutral-700" 
                    : "bg-neutral-100 text-neutral-500"
                }`}>
                  {user.telegram.allowsWriteToPm ? "On" : "Off"}
                </div>
              </div>
            )}

            {user.telegram.addedToAttachmentMenu !== undefined && (
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Attachment Menu</p>
                  <p className="text-xs text-neutral-500">Quick access</p>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.telegram.addedToAttachmentMenu 
                    ? "bg-neutral-100 text-neutral-700" 
                    : "bg-neutral-100 text-neutral-500"
                }`}>
                  {user.telegram.addedToAttachmentMenu ? "Added" : "No"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TON Wallet Section - Minimal */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-neutral-600" />
          <h2 className="text-base font-semibold text-neutral-900">TON Wallet</h2>
        </div>

        {walletError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {walletError}
          </div>
        )}

        {tonAddress ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                <p className="text-sm font-medium text-neutral-900">Connected</p>
              </div>
              
              <p className="font-mono text-xs text-neutral-600 break-all">
                {tonAddress}
              </p>
              
              {savedWalletAddress === tonAddress && (
                <p className="mt-2 text-xs text-neutral-500">✓ Connected</p>
              )}
            </div>

            <button
              onClick={handleDisconnectWallet}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
              <p className="text-sm text-neutral-600 mb-4">
                Connect your TON wallet to register proofs
              </p>
              <button
                onClick={() => tonConnectUI.openModal()}
                className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Connect Wallet
              </button>
            </div>

            {savedWalletAddress && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500 mb-1">Previously:</p>
                <p className="font-mono text-xs text-neutral-600 break-all">{savedWalletAddress}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-red-200 bg-white py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Disconnect Wallet & Log Out
        </button>
        <p className="mt-2 text-center text-xs text-neutral-500">
          This will disconnect your wallet and clear your session
        </p>
      </div>
    </div>
  );
}
