import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold text-app-foreground">404</h1>
      <p className="text-app-muted">Page not found</p>
      <Link
        href="/"
        className="rounded-full bg-app-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-app-accent/90"
      >
        Go Home
      </Link>
    </div>
  );
}

