"use client";

import { useWalletAuth } from "@/lib/wallet-auth";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Proof = {
  id: number;
  user_id: number | null;
  hash: string;
  file_name: string;
  file_size: number;
  file_type: string;
  ton_transaction_hash: string | null;
  ton_transaction_lt: string | null;
  created_at: string;
  updated_at: string;
};

export default function ProofsPage() {
  const { user, isLoading, isGuest } = useWalletAuth();
  const router = useRouter();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [proofsLoading, setProofsLoading] = useState(true);
  const [proofsError, setProofsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isGuest) {
      router.push("/");
    }
  }, [isLoading, isGuest, router]);

  const fetchUserProofs = useCallback(async () => {
    if (!user?.id) return;
    
    setProofsLoading(true);
    setProofsError(null);
    
    try {
      const response = await fetch(`/api/user/proofs?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProofs(data.proofs);
      } else {
        setProofsError(data.error || "Failed to load proofs");
      }
    } catch (error) {
      setProofsError("Failed to load proofs");
    } finally {
      setProofsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserProofs();
    }
  }, [user?.id, fetchUserProofs]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
          <p className="text-sm font-medium text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isGuest || !user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex justify-end gap-3">
          <button
            onClick={fetchUserProofs}
            disabled={proofsLoading}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh proofs"
          >
            <RefreshCw className={`h-4 w-4 ${proofsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            New Proof
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Proofs</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {proofs.length} {proofs.length === 1 ? "proof" : "proofs"} stored on TON blockchain
          </p>
        </div>
      </div>

      {/* Error Display */}
      {proofsError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{proofsError}</p>
        </div>
      )}

      {/* Proofs List */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        {proofsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
            <p className="mt-4 text-sm font-medium text-neutral-600">Loading your proofs...</p>
          </div>
        ) : proofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-neutral-100 p-6">
              <FileText className="h-12 w-12 text-neutral-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-neutral-900">No proofs yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-neutral-600">
              Get started by creating your first blockchain proof to secure your documents
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              Create Your First Proof
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {proofs.map((proof) => (
              <Link
                key={proof.id}
                href={`/result/${proof.id}`}
                className="block p-5 transition hover:bg-neutral-50 active:bg-neutral-100"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* File Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex-shrink-0 rounded-lg bg-neutral-100 p-2.5">
                      <FileText className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-neutral-900">
                        {proof.file_name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
                        <span>{formatFileSize(proof.file_size)}</span>
                        <span className="text-neutral-300">•</span>
                        <span>{formatDate(proof.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {proofs.length > 0 && !proofsLoading && (
        <div className="mt-6 text-center text-sm text-neutral-500">
          All proofs are permanently stored on the TON blockchain
        </div>
      )}
    </div>
  );
}

