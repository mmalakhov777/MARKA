import Link from "next/link";

import { getProofStoreSnapshot } from "@/lib/proof-store";
import { t } from "@/lib/i18n";
import { getDictionary } from "@/locales";

export default async function NotFoundPage() {
  const dictionary = await getDictionary();

  const debugProofs = getProofStoreSnapshot();

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-neutral-900/40 p-6 text-center">
      <h2 className="text-xl font-semibold text-app-foreground">
        {t(dictionary, "status.noResult")}
      </h2>
      <Link
        href="/"
        className="mx-auto inline-flex h-12 items-center justify-center rounded-full bg-teal-400 px-6 text-sm font-semibold text-neutral-950 transition hover:bg-teal-300"
      >
        {t(dictionary, "result.backHome")}
      </Link>

      <div className="mt-4 rounded-2xl bg-neutral-900/60 p-4 text-left text-xs text-neutral-400">
        <p className="mb-2 font-semibold text-neutral-300">Debug proof store snapshot</p>
        <pre className="whitespace-pre-wrap break-all">
{JSON.stringify(debugProofs, null, 2)}
        </pre>
      </div>
    </div>
  );
}

