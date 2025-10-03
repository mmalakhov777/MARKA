"use client";

import { type PropsWithChildren, useEffect } from "react";
import { init, miniApp, viewport, closingBehavior, swipeBehavior } from "@telegram-apps/sdk-react";
import TelegramAnalytics from "@telegram-apps/analytics";

// Get env vars at module level for client components
const ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_TG_ANALYTICS_TOKEN;
const ANALYTICS_APP_NAME = process.env.NEXT_PUBLIC_TG_ANALYTICS_APP_NAME;

export function TelegramSDKProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    // Initialize Telegram Analytics FIRST (works even outside Telegram)
    if (typeof window !== "undefined" && ANALYTICS_TOKEN && ANALYTICS_APP_NAME) {
      try {
        TelegramAnalytics.init({
          token: ANALYTICS_TOKEN,
          appName: ANALYTICS_APP_NAME,
        });
        console.log("✅ Telegram Analytics initialized");
      } catch (analyticsError) {
        console.error("Failed to initialize Telegram Analytics:", analyticsError);
      }
    }

    // Initialize Telegram SDK
    try {
      init();
      
      // MOUNT components first before using them
      if (miniApp.mount.isAvailable()) {
        miniApp.mount();
        miniApp.ready();
      }

      if (viewport.mount.isAvailable()) {
        viewport.mount();
        viewport.expand();
      }

      if (swipeBehavior.mount.isAvailable()) {
        swipeBehavior.mount();
        swipeBehavior.disableVertical();
      }

      if (closingBehavior.mount.isAvailable()) {
        closingBehavior.mount();
        closingBehavior.enableConfirmation();
      }

      // Set header color AFTER mounting
      if (miniApp.isMounted()) {
        miniApp.setHeaderColor('#ffffff');
      }
      
      // Fallback: Try native Telegram WebApp method with multiple attempts
      const enableNativeConfirmation = () => {
        if (typeof window !== "undefined") {
          const telegram = (window as typeof window & { 
            Telegram?: { 
              WebApp?: {
                enableClosingConfirmation?: () => void;
                disableVerticalSwipes?: () => void;
                ready?: () => void;
              } 
            } 
          }).Telegram?.WebApp;
          
          if (telegram) {
            telegram.ready?.();
            telegram.disableVerticalSwipes?.();
            telegram.enableClosingConfirmation?.();
          }
        }
      };
      
      // Try immediately
      enableNativeConfirmation();
      
      // Retry after 500ms (in case SDK loads late)
      setTimeout(enableNativeConfirmation, 500);
      
      // Retry after 1000ms (final attempt)
      setTimeout(enableNativeConfirmation, 1000);
      
    } catch (error) {
      console.error("Telegram SDK initialization error:", error);
    }
  }, []);

  return <>{children}</>;
}