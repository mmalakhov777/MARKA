"use client";

import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingButton() {
  const router = useRouter();

  const handleClick = () => {
    // Clear onboarding completion and navigate
    if (typeof window !== "undefined") {
      localStorage.removeItem("onboarding_completed");
    }
    router.push("/onboarding");
  };

  return (
    <button
      onClick={handleClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700"
      title="View Tutorial"
    >
      <HelpCircle className="h-4 w-4" />
    </button>
  );
}

