"use client";

import { ReactNode } from "react";
import { Layout } from "@/components/Layout";

export function FactPage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker?: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <Layout>
      <article className="w-full min-h-screen bg-background text-slate-800 dark:text-slate-200">
        <div className="max-w-[680px] mx-auto px-5 sm:px-6 pt-28 sm:pt-32 pb-24">
          {kicker && (
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/40 mb-3">
              {kicker}
            </p>
          )}
          <h1 className="text-[1.75rem] sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="mt-3 text-xs text-slate-400 dark:text-white/40">{updated}</p>
          <div className="mt-10 space-y-10 text-[15px] leading-[1.7] text-slate-600 dark:text-slate-300">
            {children}
          </div>
        </div>
      </article>
    </Layout>
  );
}

export function FactSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FactList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-4 list-disc marker:text-slate-300 dark:marker:text-white/25">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
