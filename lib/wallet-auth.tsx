"use client";

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  type PropsWithChildren 
} from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { initData, useSignal } from "@telegram-apps/sdk-react";

// User type combining wallet + optional Telegram data
export type User = {
  id: string; // UUID
  walletAddress: string; // PRIMARY identifier
  isGuest: boolean;
  userType: "individual" | "creator";
  
  // Optional Telegram data
  telegram?: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isPremium?: boolean;
    photoUrl?: string;
    allowsWriteToPm?: boolean;
    addedToAttachmentMenu?: boolean;
  };
  
  createdAt: string;
  lastLogin: string;
};

type WalletAuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasWallet: boolean;
  hasTelegram: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
};

const WalletAuthContext = createContext<WalletAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: true,
  hasWallet: false,
  hasTelegram: false,
  error: null,
  refreshUser: async () => {},
});

// Generate a stable guest ID based on browser fingerprint
function getOrCreateGuestId(): string {
  const GUEST_ID_KEY = "guest_user_id";
  
  // Check if we already have a guest ID
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // Generate a new guest ID
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
}

export function WalletAuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // TON Connect hooks
  const tonAddress = useTonAddress();
  
  // Telegram data (optional) - try both SDK and native WebApp
  const initDataState = useSignal(initData.state);
  
  // Helper to get Telegram data from either SDK or native WebApp
  const getTelegramData = () => {
    // First try @telegram-apps/sdk-react
    if (initDataState?.user) {
      return initDataState;
    }
    
    // Fallback to native Telegram WebApp
    if (typeof window !== "undefined") {
      const telegram = (window as typeof window & { 
        Telegram?: { 
          WebApp?: {
            initDataUnsafe?: Record<string, unknown>;
          } 
        } 
      }).Telegram?.WebApp;
      if (telegram?.initDataUnsafe?.user) {
        return telegram.initDataUnsafe;
      }
    }
    
    return null;
  };

  // Function to fetch user data from backend by wallet
  const fetchUserByWallet = async (walletAddress: string): Promise<User | null> => {
    try {
      const response = await fetch(`/api/user?walletAddress=${walletAddress}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        return {
          id: data.user.id,
          walletAddress: data.user.wallet_address || "",
          isGuest: data.user.is_guest || false,
          userType: data.user.user_type || "individual",
          telegram: data.user.telegram_id ? {
            id: data.user.telegram_id,
            firstName: data.user.telegram_first_name,
            lastName: data.user.telegram_last_name,
            username: data.user.telegram_username,
            languageCode: data.user.telegram_language_code,
            isPremium: data.user.telegram_is_premium,
            photoUrl: data.user.telegram_photo_url,
            allowsWriteToPm: data.user.telegram_allows_write_to_pm,
            addedToAttachmentMenu: data.user.telegram_added_to_attachment_menu,
          } : undefined,
          createdAt: data.user.created_at,
          lastLogin: data.user.last_login,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  // Function to fetch user data from backend by Telegram ID
  const fetchUserByTelegram = async (telegramId: number): Promise<User | null> => {
    try {
      const response = await fetch(`/api/user?userId=${telegramId}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        return {
          id: data.user.id,
          walletAddress: data.user.wallet_address || "",
          isGuest: data.user.is_guest || false,
          userType: data.user.user_type || "individual",
          telegram: data.user.telegram_id ? {
            id: data.user.telegram_id,
            firstName: data.user.telegram_first_name,
            lastName: data.user.telegram_last_name,
            username: data.user.telegram_username,
            languageCode: data.user.telegram_language_code,
            isPremium: data.user.telegram_is_premium,
            photoUrl: data.user.telegram_photo_url,
            allowsWriteToPm: data.user.telegram_allows_write_to_pm,
            addedToAttachmentMenu: data.user.telegram_added_to_attachment_menu,
          } : undefined,
          createdAt: data.user.created_at,
          lastLogin: data.user.last_login,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  // Telegram data type
  type TelegramData = {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isPremium?: boolean;
    photoUrl?: string;
    allowsWriteToPm?: boolean;
    addedToAttachmentMenu?: boolean;
  };

  // Function to create or update user
  const upsertUser = async (
    walletAddress: string | null, 
    telegramData?: TelegramData
  ): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          telegram: telegramData,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        return {
          id: data.user.id,
          walletAddress: data.user.wallet_address || "",
          isGuest: data.user.is_guest || false,
          userType: data.user.user_type || "individual",
          telegram: data.user.telegram_id ? {
            id: data.user.telegram_id,
            firstName: data.user.telegram_first_name,
            lastName: data.user.telegram_last_name,
            username: data.user.telegram_username,
            languageCode: data.user.telegram_language_code,
            isPremium: data.user.telegram_is_premium,
            photoUrl: data.user.telegram_photo_url,
            allowsWriteToPm: data.user.telegram_allows_write_to_pm,
            addedToAttachmentMenu: data.user.telegram_added_to_attachment_menu,
          } : undefined,
          createdAt: data.user.created_at,
          lastLogin: data.user.last_login,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const refreshUser = async () => {
    if (tonAddress) {
      const userData = await fetchUserByWallet(tonAddress);
      if (userData) {
        setUser(userData);
      }
    }
  };

  // Main authentication effect
  useEffect(() => {
    async function authenticate() {
      try {
        const telegramState = getTelegramData();

        // Get Telegram data if available
        let telegramData: TelegramData | null = null;
        if (telegramState?.user) {
          const userData = telegramState.user as unknown as Record<string, unknown>;
          telegramData = {
            id: userData.id as number,
            firstName: (userData.first_name as string) || (userData.firstName as string),
            lastName: (userData.last_name as string) || (userData.lastName as string),
            username: userData.username as string | undefined,
            languageCode: (userData.language_code as string) || (userData.languageCode as string),
            isPremium: (userData.is_premium as boolean) || (userData.isPremium as boolean),
            photoUrl: (userData.photo_url as string) || (userData.photoUrl as string),
            allowsWriteToPm: (userData.allows_write_to_pm as boolean) || (userData.allowsWriteToPm as boolean),
            addedToAttachmentMenu: (userData.added_to_attachment_menu as boolean) || (userData.addedToAttachmentMenu as boolean),
          };
        }

        // Case 1: User has connected wallet
        if (tonAddress) {
          // Try to fetch existing user by wallet OR telegram
          let userData = await fetchUserByWallet(tonAddress);
          
          // If no user found by wallet, check by telegram_id
          if (!userData && telegramData) {
            userData = await fetchUserByTelegram(telegramData.id);
          }
          
          // If no user exists, create one
          if (!userData) {
            userData = await upsertUser(tonAddress, telegramData || undefined);
          } 
          // If user exists and we have Telegram data, always update it
          // This handles: new Telegram data, updated Telegram info, or just refresh
          else if (telegramData) {
            userData = await upsertUser(tonAddress, telegramData);
          }
          // If user exists but no new Telegram data, just refresh to update last_login
          else {
            userData = await upsertUser(tonAddress, undefined);
          }
          
          if (userData) {
            setUser(userData);
            setError(null);
          } else {
            setError("Failed to create or fetch user");
          }
        } 
        // Case 2: No wallet, but has Telegram
        // Create/fetch Telegram-only user (can browse but can't upload)
        else if (telegramData) {
          // Try to fetch or create user with Telegram only
          let userData = await fetchUserByTelegram(telegramData.id);
          
          if (!userData) {
            userData = await upsertUser(null, telegramData);
          }
          
          if (userData) {
            // Mark as guest since no wallet (limited features)
            setUser({
              ...userData,
              isGuest: true, // No wallet = still guest
            });
            setError(null);
          } else {
            setUser(null);
            setError(null);
          }
        }
        // Case 3: Guest user (no wallet, no Telegram)
        else {
          // Create a minimal guest user object for UI
          const guestId = getOrCreateGuestId();
          setUser({
            id: guestId,
            walletAddress: "",
            isGuest: true,
            userType: "individual",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          });
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication error");
      } finally {
        setIsLoading(false);
      }
    }

    // Delay to ensure TON Connect is loaded
    const timer = setTimeout(() => {
      authenticate();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonAddress, initDataState]);

  const contextValue: WalletAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !user.isGuest,
    isGuest: user?.isGuest ?? true,
    hasWallet: !!tonAddress && !!user && !user.isGuest,
    hasTelegram: !!user?.telegram,
    error,
    refreshUser,
  };

  return (
    <WalletAuthContext.Provider value={contextValue}>
      {children}
    </WalletAuthContext.Provider>
  );
}

export function useWalletAuth() {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error("useWalletAuth must be used within WalletAuthProvider");
  }
  return context;
}

// Backwards compatibility hook (for gradual migration)
export function useTelegramAuth() {
  const { user, isLoading, isAuthenticated, error } = useWalletAuth();
  
  return {
    user: user?.telegram ? {
      id: user.telegram.id,
      firstName: user.telegram.firstName || "",
      lastName: user.telegram.lastName,
      username: user.telegram.username,
      languageCode: user.telegram.languageCode,
      isPremium: user.telegram.isPremium,
      photoUrl: user.telegram.photoUrl,
      allowsWriteToPm: user.telegram.allowsWriteToPm,
      addedToAttachmentMenu: user.telegram.addedToAttachmentMenu,
    } : null,
    isLoading,
    isAuthenticated: isAuthenticated && !!user?.telegram,
    error,
  };
}

