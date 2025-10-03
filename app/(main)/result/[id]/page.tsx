"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProofDetails } from "@/components/proof-details";
import { getDictionary } from "@/locales";
import { enTranslations } from "@/locales/en";
import type { HashResponse } from "@/lib/validation";

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [proof, setProof] = useState<HashResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dictionary, setDictionary] = useState<typeof enTranslations | null>(null);

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

  if (!mounted || !dictionary) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
      </div>
    );
  }

  if (error || !proof) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background - official paper */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50/30 via-[#fffef9] to-neutral-100/30" />

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        {/* Header with New Proof button */}
        <div className={`mb-6 flex justify-end transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Proof
          </Link>
        </div>

        <div className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <ProofDetails dictionary={dictionary} proof={proof} />
        </div>
      </div>
    </div>
  );
}

