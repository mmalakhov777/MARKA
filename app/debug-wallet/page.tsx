"use client";

import { useTonConnectUI, useTonAddress, useTonWallet } from "@tonconnect/ui-react";
import { useWalletAuth } from "@/lib/wallet-auth";
import { RefreshCw, Wallet, X } from "lucide-react";
import { useState } from "react";

export default function DebugWalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const wallet = useTonWallet();
  const { user, isLoading, isGuest } = useWalletAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleForceDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
      // Force page reload after disconnect
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
    }
  };

  const handleForceRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleTestAPI = async () => {
    if (!tonAddress) {
      alert("No wallet connected");
      return;
    }

    try {
      const response = await fetch(`/api/user?walletAddress=${tonAddress}`);
      const data = await response.json();
      alert(`API Test: ${data.success ? "SUCCESS" : "FAILED"}\n\nCheck console for details`);
    } catch (err) {
      alert("API test failed. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-app-surface p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-app-foreground">
          🔧 Wallet Debug Tool
        </h1>

        {/* TON Connect SDK State */}
        <div className="mb-6 rounded-lg bg-app-surface-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-app-foreground">
            TON Connect SDK State
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-app-muted">Connected:</span>
              <span className={tonAddress ? "text-green-500" : "text-red-500"}>
                {tonAddress ? "YES" : "NO"}
              </span>
            </div>
            {tonAddress && (
              <>
                <div className="flex justify-between">
                  <span className="text-app-muted">Address:</span>
                  <span className="text-app-foreground">{tonAddress.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-muted">Wallet Type:</span>
                  <span className="text-app-foreground">{wallet?.device.appName || "Unknown"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* App Auth State */}
        <div className="mb-6 rounded-lg bg-app-surface-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-app-foreground">
            App Auth State
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-app-muted">Loading:</span>
              <span className="text-app-foreground">{isLoading ? "YES" : "NO"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-app-muted">Is Guest:</span>
              <span className={isGuest ? "text-red-500" : "text-green-500"}>
                {isGuest ? "YES" : "NO"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-app-muted">User ID:</span>
              <span className="text-app-foreground">{user?.id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-app-muted">Wallet Address:</span>
              <span className="text-app-foreground">
                {user?.walletAddress ? user.walletAddress.slice(0, 10) + "..." : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Problem Detection */}
        {tonAddress && isGuest && (
          <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-700">
              ⚠️ Problem Detected
            </h2>
            <p className="mb-4 text-sm text-red-600">
              Wallet is connected in TON Connect SDK but app shows Guest state.
              This means the authentication flow is not completing properly.
            </p>
            <p className="text-sm text-red-600">
              <strong>Possible causes:</strong>
            </p>
            <ul className="ml-4 mt-2 list-disc text-sm text-red-600">
              <li>API request failing silently</li>
              <li>User not created in database</li>
              <li>React state not updating</li>
              <li>TON Connect SDK cache issue</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleTestAPI}
            disabled={!tonAddress}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            <Wallet className="h-5 w-5" />
            Test API Call
          </button>

          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-app-accent px-6 py-3 text-white transition hover:bg-app-accent/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
            Force Refresh Page
          </button>

          {tonAddress && (
            <button
              onClick={handleForceDisconnect}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-3 text-white transition hover:bg-red-600"
            >
              <X className="h-5 w-5" />
              Disconnect & Reset
            </button>
          )}

          {!tonAddress && (
            <button
              onClick={() => tonConnectUI.openModal()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white transition hover:bg-green-600"
            >
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">How to Fix:</h3>
          <ol className="ml-4 list-decimal space-y-1 text-sm text-blue-800">
            <li>Click &quot;Test API Call&quot; to see if the backend is working</li>
            <li>Check browser console (F12) for error messages</li>
            <li>If wallet connected but showing guest, try &quot;Disconnect & Reset&quot;</li>
            <li>After reset, click &quot;Connect Wallet&quot; to reconnect fresh</li>
            <li>If still not working, check that dev server restarted after code changes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

