"use client";

import { useWalletAuth } from "@/lib/wallet-auth";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";

export function UserTypeBadge() {
  const { user } = useWalletAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return null;
  }

  const userType = user.userType || "individual";
  const isCreator = userType === 'creator';
  const level = isCreator ? 2 : 1;
  const levelText = isCreator ? 'Creator' : 'Basic';

  return (
    <Link
      href="/levels"
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition hover:opacity-70 ${
        isCreator 
          ? 'bg-neutral-900 text-white' 
          : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      <Star className={`h-3 w-3 ${isCreator ? 'fill-white' : 'fill-neutral-400'}`} />
      <span className="text-xs font-medium">Level {level}</span>
      <span className="text-xs opacity-60">·</span>
      <span className="text-xs">{levelText}</span>
    </Link>
  );
}

