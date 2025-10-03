"use client";

import { Star, Globe, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LevelsPage() {

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Account Levels
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Upgrade your account by verifying your social media presence
        </p>
      </div>

      {/* Level 1 - Basic */}
      <div className="paper-card letter-edge rounded-lg border-2 border-neutral-300/40 bg-neutral-50/60 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1">
            <Star className="h-3 w-3 fill-neutral-400" />
            <span className="text-xs font-medium text-neutral-600">Level 1</span>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Individual</h2>
        </div>

        <p className="mb-4 text-sm text-neutral-600">
          Default account level for all users
        </p>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Upload and register proofs on blockchain</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Generate QR watermarks for your content</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Prove authorship with cryptographic signatures</p>
          </div>
        </div>
      </div>

      {/* Level 2 - Creator */}
      <div className="paper-card letter-edge rounded-lg border-2 border-neutral-300/40 bg-neutral-50/60 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1">
            <Star className="h-3 w-3 fill-white" />
            <span className="text-xs font-medium text-white">Level 2</span>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Verified Creator</h2>
        </div>

        <p className="mb-4 text-sm text-neutral-600">
          Unlock by verifying at least one social media account
        </p>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-700" />
            <p className="text-sm text-neutral-900 font-medium">All Level 1 features, plus:</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Verified creator badge on your profile</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Linked social media presence verification</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Enhanced credibility for your proofs</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
            <p className="text-sm text-neutral-700">Cross-platform identity verification</p>
          </div>
        </div>

        <Link
          href="/social"
          className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Globe className="h-4 w-4" />
          Verify Social Accounts
        </Link>
      </div>

      {/* How Verification Works */}
      <div className="paper-card rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          How Social Verification Works
        </h2>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-900">Add Your Social Account</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Provide your social media platform name and profile link
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-900">Create Verification Post</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Post your proof verification link or QR code on your social media profile
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-900">Submit for Review</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Share the link to your verification post with us
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-900">Get Verified</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Our team reviews within 24-48 hours. You&apos;ll be upgraded to Creator automatically!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Verify */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
        <h3 className="mb-3 text-sm font-medium text-neutral-900">Why Verify Your Social Accounts?</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
            <span>Prove you&apos;re a real content creator, not AI</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
            <span>Link your blockchain proofs to your public identity</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
            <span>Build trust with your audience across platforms</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
            <span>Access enhanced creator features and credibility</span>
          </li>
        </ul>
      </div>

      {/* Pro Tip */}
      <div className="paper-card letter-edge rounded-lg border-l-4 border-neutral-500/60 bg-amber-50/50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <span className="text-sm font-bold text-amber-700">💡</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Pro Tip</h3>
            <p className="mt-1 text-sm text-neutral-700">
              It&apos;s better to add all social accounts you have. The more verified accounts linked to your wallet, the stronger your proof of identity and authorship becomes. This prevents others from claiming they created your content.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/social"
        className="letter-edge flex h-12 items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99]"
      >
        <Globe className="h-4 w-4" />
        Start Verification Process
      </Link>
    </div>
  );
}

