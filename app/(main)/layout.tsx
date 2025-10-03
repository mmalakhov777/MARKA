import { OnboardingCheck } from "@/components/onboarding-check";
import { MobileFooterNav } from "@/components/mobile-footer-nav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OnboardingCheck>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-10">
        <main className="flex-1 pb-20">{children}</main>
        <MobileFooterNav />
      </div>
    </OnboardingCheck>
  );
}
