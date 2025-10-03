"use client";

import { useWalletAuth } from "@/lib/wallet-auth";
import { Globe, Link as LinkIcon, Plus, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type SocialAccount = {
  id: number;
  user_v2_id: string; // UUID from users_v2 table
  platform: string;
  profile_url: string;
  verification_post_url: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
  notes?: string;
};

export default function SocialAccountsPage() {
  const { user, isLoading, isGuest } = useWalletAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [platform, setPlatform] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [verificationPostUrl, setVerificationPostUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isGuest) {
      router.push("/");
    }
  }, [isLoading, isGuest, router]);

  const fetchSocialAccounts = useCallback(async () => {
    if (!user?.id) return;
    
    setAccountsLoading(true);
    
    try {
      const response = await fetch(`/api/user/social?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      // Error fetching social accounts
    } finally {
      setAccountsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchSocialAccounts();
    }
  }, [user?.id, fetchSocialAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!platform || !profileUrl || !verificationPostUrl) {
      setError("All fields are required");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch("/api/user/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          platform,
          profileUrl,
          verificationPostUrl,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAccounts([data.account, ...accounts]);
        resetForm();
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPlatform("");
    setProfileUrl("");
    setVerificationPostUrl("");
    setShowAddForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
      </div>
    );
  }

  if (isGuest || !user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      {!showAddForm && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={fetchSocialAccounts}
            disabled={accountsLoading}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh accounts"
          >
            <RefreshCw className={`h-4 w-4 ${accountsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      )}

      {/* Title */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Unlock Creator Status
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Link your social media accounts to prove your identity across platforms
        </p>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            Add Social Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Platform Name */}
            <div>
              <label htmlFor="platform" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Social Network
              </label>
              <input
                id="platform"
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g., Twitter, Instagram, LinkedIn"
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* Profile URL */}
            <div>
              <label htmlFor="profileUrl" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Profile Link
              </label>
              <input
                id="profileUrl"
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://twitter.com/yourname"
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {/* Verification Post URL */}
            <div>
              <label htmlFor="verificationPost" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Verification Post Link
              </label>
              <input
                id="verificationPost"
                type="url"
                value={verificationPostUrl}
                onChange={(e) => setVerificationPostUrl(e.target.value)}
                placeholder="Link to post with verification QR or link"
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Post must include your proof verification link or QR code watermark
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">
          Your Accounts
        </h2>

        {accountsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
            <p className="mt-4 text-sm text-neutral-500">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Globe className="h-10 w-10 text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-500">
              No social accounts added yet
            </p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Add Your First Account
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-neutral-600" />
                      <h3 className="text-sm font-medium text-neutral-900">
                        {account.platform}
                      </h3>
                    </div>
                    
                    <a
                      href={account.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {account.profile_url}
                    </a>

                    {account.notes && (
                      <p className="mt-2 text-xs text-neutral-500">{account.notes}</p>
                    )}
                  </div>

                  <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${getStatusColor(account.status)}`}>
                    {getStatusIcon(account.status)}
                    <span className="text-xs font-medium">{getStatusText(account.status)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-neutral-900">How It Works</h3>
        <ol className="space-y-1.5 text-xs text-neutral-600">
          <li>1. Add your social media profile link</li>
          <li>2. Create a post with your proof verification link or QR watermark</li>
          <li>3. Submit the post link for review</li>
          <li>4. Our team will verify and approve within 24-48 hours</li>
        </ol>
      </div>
    </div>
  );
}

