"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, useState } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { createQueryClient } from "@/lib/react-query";
import { TelegramSDKProvider } from "@/lib/telegram-provider";
import { WalletAuthProvider } from "@/lib/wallet-auth";

const manifestUrl = "https://marka-proof.org/tonconnect-manifest.json";

export function AppProviders({ children }: PropsWithChildren) {
  // Create QueryClient instance per component instance (recommended by React Query docs)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <TelegramSDKProvider>
          <WalletAuthProvider>
            {children}
          </WalletAuthProvider>
        </TelegramSDKProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}

