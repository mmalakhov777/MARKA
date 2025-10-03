"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { initData, useSignal } from "@telegram-apps/sdk-react";

// Telegram WebApp types
interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name?: string;
      firstName?: string;
      last_name?: string;
      lastName?: string;
      username?: string;
      language_code?: string;
      languageCode?: string;
      is_premium?: boolean;
      isPremium?: boolean;
      photo_url?: string;
      photoUrl?: string;
      allows_write_to_pm?: boolean;
      allowsWriteToPm?: boolean;
      added_to_attachment_menu?: boolean;
      addedToAttachmentMenu?: boolean;
    };
  };
}

interface WindowWithTelegram extends Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

// Telegram user data type
export type TelegramUser = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
  allowsWriteToPm?: boolean;
  addedToAttachmentMenu?: boolean;
};

type TelegramAuthContextType = {
  user: TelegramUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

const TelegramAuthContext = createContext<TelegramAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
});

export function TelegramAuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get Telegram WebApp init data
  const initDataState = useSignal(initData.state);
  const initDataRaw = useSignal(initData.raw);

  useEffect(() => {
    async function authenticateUser() {
      try {
        // Try to get Telegram WebApp object directly
        const tg = (window as unknown as WindowWithTelegram).Telegram?.WebApp;
        
        // Check if we have Telegram user data from SDK or native WebApp
        const sdkUser = initDataState?.user;
        const nativeUser = tg?.initDataUnsafe?.user;
        
        if (!sdkUser && !nativeUser) {
          // Development mode fallback - create a mock user
          if (process.env.NODE_ENV === "development") {
            const mockUser: TelegramUser = {
              id: 123456789,
              firstName: "Dev",
              lastName: "User",
              username: "devuser",
              languageCode: "en",
              isPremium: false,
            };
            setUser(mockUser);
            
            // Save mock user to database
            await fetch("/api/auth/telegram", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user: mockUser, initDataRaw: "" }),
            });
          } else {
            setError("Not running in Telegram WebApp");
          }
          setIsLoading(false);
          return;
        }
        
        // Use SDK data if available, otherwise use native WebApp data
        const userData = sdkUser || nativeUser;
        
        if (!userData) {
          setError("No user data available");
          setIsLoading(false);
          return;
        }

        // Extract user data from Telegram (handle both SDK and native formats)
        // TypeScript safe access for both formats
        const userRecord = userData as Record<string, unknown>;
        const telegramUser: TelegramUser = {
          id: userData.id,
          firstName: (userRecord.first_name as string) || (userRecord.firstName as string) || "",
          lastName: (userRecord.last_name as string) || (userRecord.lastName as string),
          username: userRecord.username as string | undefined,
          languageCode: (userRecord.language_code as string) || (userRecord.languageCode as string),
          isPremium: (userRecord.is_premium as boolean) || (userRecord.isPremium as boolean) || false,
          photoUrl: (userRecord.photo_url as string) || (userRecord.photoUrl as string),
          allowsWriteToPm: (userRecord.allows_write_to_pm as boolean) || (userRecord.allowsWriteToPm as boolean),
          addedToAttachmentMenu: (userRecord.added_to_attachment_menu as boolean) || (userRecord.addedToAttachmentMenu as boolean),
        };

        // Send user data to backend for verification and storage
        const initDataString = initDataRaw || tg?.initData || "";
        
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: telegramUser,
            initDataRaw: initDataString,
          }),
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        
        if (data.success) {
          setUser(telegramUser);
        } else {
          setError(data.error || "Authentication failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication error");
      } finally {
        setIsLoading(false);
      }
    }

    // Add a small delay to ensure Telegram WebApp script is loaded
    const timer = setTimeout(() => {
      authenticateUser();
    }, 100);

    return () => clearTimeout(timer);
  }, [initDataState, initDataRaw]);

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
      }}
    >
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (!context) {
    throw new Error("useTelegramAuth must be used within TelegramAuthProvider");
  }
  return context;
}


