import type { Metadata } from "next";
import Link from "next/link";
import Impressum from "@/views/Impressum";
import { IMPRESSUM_PREVIEW, IMPRESSUM_READY } from "@/lib/impressumData";
import { PublicNavbar } from "@/components/PublicNavbar";

export const metadata: Metadata = {
  title: "Impressum | ORIVE",
  description: "Anbieterkennzeichnung von ORIVE (orive.co) gemäß § 5 DDG.",
  robots: IMPRESSUM_READY ? undefined : { index: false, follow: false },
};

export default function ImpressumPage() {
  if (IMPRESSUM_READY || IMPRESSUM_PREVIEW) return <Impressum />;
  // Not public yet: no redirect to the AGB any more, just a short neutral notice.
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] dark:bg-[#011B33]">
      <PublicNavbar />
      <main className="mx-auto w-full max-w-[680px] flex-1 px-5 pb-24 pt-28 sm:pt-32">
        <h1 className="text-3xl font-semibold tracking-tight text-[#01223F] dark:text-white">Impressum</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600 dark:text-white/70">
          Die Anbieterkennzeichnung wird gerade aktualisiert. Bei Fragen erreichst du uns unter{" "}
          <a href="mailto:robert.linke@me.com" className="underline underline-offset-4">robert.linke@me.com</a>.
        </p>
        <p className="mt-6 text-sm text-slate-500 dark:text-white/50">
          <Link href="/agb" className="underline underline-offset-4">AGB</Link> · <Link href="/datenschutz" className="underline underline-offset-4">Datenschutz</Link>
        </p>
      </main>
    </div>
  );
}
