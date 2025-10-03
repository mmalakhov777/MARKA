import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel for managing Marka proof database records and user accounts.",
  robots: {
    index: false,
    follow: false,
  },
};

// This layout completely overrides the root layout for /admin routes
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {children}
    </div>
  );
}
