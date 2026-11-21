import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageComponent from "../../../views/SessionDetail";
import { getSessionById } from "@/data/sessionsData";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateMetadata({ params }: { params: { sessionId: string } }): Metadata {
  const s = getSessionById(params.sessionId);
  return s
    ? { title: `${s.title} | ORIVE`, description: String(s.description || "").slice(0, 155) }
    : { title: "Session | ORIVE", robots: { index: false, follow: true } };
}

export default function Page({ params }: { params: { sessionId: string } }) {
  const id = decodeURIComponent(params.sessionId || "");
  // Real 404 status for ids that can never exist (not a DB uuid and not a known local session).
  if (!UUID.test(id) && !getSessionById(id)) notFound();
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PageComponent />
    </Suspense>
  );
}
