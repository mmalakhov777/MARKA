"use client";

import { Home, User, FileText, Globe, HelpCircle, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletAuth } from "@/lib/wallet-auth";
import { ConnectWalletModal } from "./connect-wallet-modal";
import { useState } from "react";

export function MobileFooterNav() {
  const pathname = usePathname();
  const { isGuest } = useWalletAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      requiresWallet: false,
    },
    {
      href: "/proofs",
      icon: FileText,
      label: "Proofs",
      requiresWallet: true,
    },
    {
      href: "/faq",
      icon: HelpCircle,
      label: "FAQ",
      requiresWallet: false,
    },
    {
      href: "/social",
      icon: Globe,
      label: "Social",
      requiresWallet: true,
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      requiresWallet: true,
    },
  ];

  const handleLockedClick = (label: string) => {
    setSelectedFeature(label);
    setModalOpen(true);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isLocked = isGuest && item.requiresWallet;

            // For locked items, render as clickable button that opens modal
            if (isLocked) {
              return (
                <button
                  key={item.href}
                  onClick={() => handleLockedClick(item.label)}
                  className="group flex flex-1 flex-col items-center gap-1 py-3 transition-all active:scale-95"
                >
                  <div className="relative">
                    <div className="rounded-lg bg-neutral-100 p-1.5 transition-colors group-hover:bg-neutral-200">
                      <Icon className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-500" strokeWidth={2} />
                    </div>
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900">
                      <Lock className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-neutral-400 transition-colors group-hover:text-neutral-500">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        feature={selectedFeature}
      />
    </>
  );
}

