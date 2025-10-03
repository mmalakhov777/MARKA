"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Public pages that should be accessible without onboarding
    const publicPages = [
      '/proof/', // Any proof page
      '/result/', // Any result page
      '/faq',
      '/levels',
    ];

    // Check if current page is public
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

    // If it's a public page, skip onboarding check
    if (isPublicPage) {
      setIsChecking(false);
      return;
    }

    // For non-public pages, check onboarding status
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    
    if (!hasCompletedOnboarding) {
      router.push("/onboarding");
    } else {
      setIsChecking(false);
    }
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-teal-400" />
      </div>
    );
  }

  return <>{children}</>;
}

