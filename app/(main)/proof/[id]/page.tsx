"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { getDictionary } from "@/locales";
import { enTranslations } from "@/locales/en";
import type { HashResponse } from "@/lib/validation";
import { ShieldCheck, Clock, AlertCircle, CheckCircle2, ExternalLink, Globe, ChevronDown, ChevronUp } from "lucide-react";

type SocialAccount = {
  id: number;
  user_v2_id: string;
  platform: string;
  profile_url: string;
  verification_post_url: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  updated_at: string;
  notes?: string;
};

export default function PublicProofPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [proof, setProof] = useState<HashResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dictionary, setDictionary] = useState<typeof enTranslations | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getDictionary().then(setDictionary);
  }, []);

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const response = await fetch(`/api/hash?id=${id}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = await response.json();
        setProof(data);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProof();
  }, [id]);

  // Fetch social accounts when proof is loaded
  useEffect(() => {
    const fetchSocialAccounts = async () => {
      if (!proof?.userId) return;
      
      try {
        const response = await fetch(`/api/user/social?userId=${proof.userId}`);
        const data = await response.json();
        if (data.success) {
          // Show all accounts with their verification statuses
          setSocialAccounts(data.accounts);
        }
      } catch (error) {
        // Error fetching social accounts
      }
    };

    fetchSocialAccounts();
  }, [proof?.userId]);

  // Poll for verification status if pending
  useEffect(() => {
    if (!proof || proof.status !== "pending") return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/hash?id=${proof.id}`);
        if (response.ok) {
          const updatedProof = await response.json();
          if (updatedProof.status !== proof.status) {
            setProof(updatedProof);
          }
        }
      } catch (error) {
        // Status check failed
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [proof]);

  if (!mounted || !dictionary) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
          <p className="text-sm font-medium text-neutral-600">Loading verification...</p>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return notFound();
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-6 pb-24">
      {/* Minimal background like home page */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30" />

      {/* Content */}
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        
        {/* FOCUS 1: What Was Verified - Clean Hero */}
        <div className={`mb-6 transition-all duration-700 ease-out ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="paper-card rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
            {/* Status Badge - Minimal */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
              {proof.status === "pending" && (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  <span>Verification Pending</span>
                </>
              )}
              {(proof.status === "confirmed" || proof.status === "verified") && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-700">Verified on Blockchain</span>
                </>
              )}
              {proof.status === "failed" && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-red-700">Verification Failed</span>
                </>
              )}
            </div>

            {/* Main Content */}
            <h1 className="mb-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
              Verified Content Registration
            </h1>
            <p className="mb-6 text-sm text-neutral-600">
              {proof.status === "pending" && "Waiting for blockchain confirmation..."}
              {(proof.status === "confirmed" || proof.status === "verified") && "This content has been permanently registered on the TON blockchain"}
              {proof.status === "failed" && proof.errorMessage}
            </p>

            {/* File Name - Prominent */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-600">Registered File</p>
              <p className="break-words text-base font-semibold text-neutral-900">{proof.fileName}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Registered on {new Date(proof.createdAt).toLocaleDateString()} at {new Date(proof.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* FOCUS 2: Who Verified (Wallet) */}
        {proof.walletAddress && (
          <div className={`mb-6 transition-all duration-700 ease-out ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`} style={{ transitionDelay: '100ms' }}>
            <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-neutral-700" />
                <h2 className="text-lg font-semibold text-neutral-900">Creator&apos;s Wallet</h2>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="break-all font-mono text-xs text-neutral-800 sm:text-sm">{proof.walletAddress}</p>
              </div>
              <p className="mt-3 text-xs text-neutral-600">
                TON blockchain wallet address that registered this content
              </p>
            </div>
          </div>
        )}

        {/* FOCUS 3: Verified Social Accounts */}
        {socialAccounts.length > 0 && (
          <div className={`mb-6 transition-all duration-700 ease-out ${
            animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-neutral-700" />
                <h2 className="text-lg font-semibold text-neutral-900">Creator&apos;s Social Accounts</h2>
              </div>
              
              {socialAccounts.filter(acc => acc.status === 'verified').length > 0 ? (
                <div className="space-y-3">
                  {socialAccounts.filter(acc => acc.status === 'verified').map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="mb-1 text-sm font-semibold text-neutral-900">{account.platform}</p>
                        <a
                          href={account.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 break-all text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
                        >
                          {account.profile_url}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show pending accounts in collapsed state */}
                  {socialAccounts.filter(acc => acc.status === 'pending').length > 0 && (
                    <p className="mt-2 text-xs text-neutral-500">
                      + {socialAccounts.filter(acc => acc.status === 'pending').length} pending verification
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Pending Verification</p>
                      <p className="mt-1 text-xs text-neutral-600">
                        {socialAccounts.length} social {socialAccounts.length === 1 ? 'account' : 'accounts'} awaiting verification by our team
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Clean */}
        <div className={`mb-8 flex flex-wrap justify-center gap-3 transition-all duration-700 ease-out ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '300ms' }}>
          <button
            onClick={() => router.push('/faq')}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]"
          >
            How does this work?
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98]"
          >
            Register your content
          </button>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-neutral-200" />

        {/* Secondary Info - All Collapsed by Default */}
        <div className={`space-y-3 transition-all duration-700 ease-out ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '400ms' }}>
          
          <p className="mb-4 text-center text-xs text-neutral-500">Additional Information</p>

          {/* What is this? */}
          <div className="paper-card overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-neutral-50"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neutral-600" />
                <h3 className="text-sm font-semibold text-neutral-900">What is this?</h3>
              </div>
              {showExplanation ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
            </button>
            {showExplanation && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm leading-relaxed text-neutral-700">
                  This is a blockchain-based proof of content registration. Creators register their content 
                  on the TON blockchain from their publicly announced wallet address. This creates a verifiable 
                  record of <strong>who registered what and when</strong>.
                </p>
              </div>
            )}
          </div>

          {/* File Details */}
          <div className="paper-card overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <button
              onClick={() => setShowFileDetails(!showFileDetails)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-neutral-50"
            >
              <h3 className="text-sm font-semibold text-neutral-900">File Details</h3>
              {showFileDetails ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
            </button>
            {showFileDetails && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-600">File Name</p>
                    <p className="break-words text-sm text-neutral-800">{proof.fileName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-600">Registration Date</p>
                    <p className="text-sm text-neutral-800">{new Date(proof.createdAt).toLocaleString()}</p>
                  </div>
                  {proof.fileType && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-600">File Type</p>
                      <p className="text-sm text-neutral-800">{proof.fileType}</p>
                    </div>
                  )}
                  {proof.fileSize && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-600">File Size</p>
                      <p className="text-sm text-neutral-800">{(proof.fileSize / 1024).toFixed(2)} KB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Technical Details */}
          <div className="paper-card overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-neutral-50"
            >
              <h3 className="text-sm font-semibold text-neutral-900">Technical Details</h3>
              {showTechnicalDetails ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
            </button>
            {showTechnicalDetails && (
              <div className="border-t border-neutral-200 bg-neutral-50 p-4 space-y-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-600">Content Hash (Fingerprint)</p>
                  <div className="rounded-md bg-white p-3 border border-neutral-200">
                    <p className="break-all font-mono text-xs text-neutral-800">{proof.hash}</p>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Unique cryptographic fingerprint generated from file content
                  </p>
                </div>
                {proof.walletAddress && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-600">Registered By (TON Wallet)</p>
                    <div className="rounded-md bg-white p-3 border border-neutral-200">
                      <p className="break-all font-mono text-xs text-neutral-800">{proof.walletAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blockchain Proof */}
          {proof.tonscanUrl && (
            <div className="paper-card overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
              <button
                onClick={() => setShowBlockchainDetails(!showBlockchainDetails)}
                className="flex w-full items-center justify-between p-4 text-left transition hover:bg-neutral-50"
              >
                <h3 className="text-sm font-semibold text-neutral-900">Blockchain Proof</h3>
                {showBlockchainDetails ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
              </button>
              {showBlockchainDetails && (
                <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                  <p className="mb-3 text-sm text-neutral-700">
                    This registration is permanently recorded on the TON blockchain. Anyone can verify it independently.
                  </p>
                  <a
                    href={proof.tonscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98]"
                  >
                    View on TONScan
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Important Notice */}
          <div className="paper-card rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-lg">⚠️</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-neutral-900">Important</h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-700">
                  This proves that a file was registered at a specific time. It does <strong>not</strong> prove 
                  copyright ownership or who originally created the content. The creator verifies themselves 
                  by publicly announcing their wallet on verified social media accounts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal feature strip */}
        <div className="mt-8 flex items-center justify-center gap-6 text-center text-xs text-neutral-400">
          <span>Blockchain Verified</span>
          <span className="text-neutral-300">•</span>
          <span>Human Created</span>
          <span className="text-neutral-300">•</span>
          <span>Forever Yours</span>
        </div>
      </div>
    </div>
  );
}


