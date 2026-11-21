import { notFound } from "next/navigation";
import { findDirectoryProfile, isDirectoryRemoved } from "@/lib/directorySample";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const box = { maxWidth: 560, margin: "0 auto", padding: "64px 16px", fontFamily: "Inter, system-ui, sans-serif", color: "#01223F" } as const;

// Removal without login: the request is recorded server-side and the profile is hidden immediately.
// Mail: only an internal notification to robert.linke@me.com; the requester gets no mail.
export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams: { done?: string; err?: string } }) {
  const p = await findDirectoryProfile(params.slug);
  if (!p) notFound();
  if (searchParams?.done === "1" || isDirectoryRemoved(p.slug)) {
    return (
      <main style={box}>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Profil entfernt</h1>
        <p style={{ marginTop: 16, lineHeight: 1.6 }}>Das Profil „{p.name}“ ist ab sofort nicht mehr auf Orive sichtbar. Dein Antrag wurde gespeichert. Fragen? <a href="mailto:robert.linke@me.com" style={{ textDecoration: "underline" }}>robert.linke@me.com</a></p>
      </main>
    );
  }
  return (
    <main style={box}>
      <h1 style={{ fontSize: 26, fontWeight: 600 }}>Profil entfernen</h1>
      <p style={{ marginTop: 8, opacity: 0.7 }}>{p.name} · {p.city}</p>
      <p style={{ marginTop: 20, lineHeight: 1.6 }}>Wenn du nicht auf Orive gelistet sein möchtest, entfernen wir es sofort – ohne Anmeldung.</p>
      {searchParams?.err ? <p style={{ marginTop: 12, color: "#b42318" }}>Bitte bestätige die Entfernung.</p> : null}
      <form method="post" action="/api/directory/remove" style={{ marginTop: 24, display: "grid", gap: 12 }}>
        <input type="hidden" name="slug" value={p.slug} />
        <label style={{ display: "grid", gap: 6 }}>Grund (optional)
          <textarea name="reason" maxLength={1000} rows={3} style={{ border: "1px solid #0003", borderRadius: 8, padding: 10 }} />
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="confirm" value="1" required /> Ja, dieses Profil soll entfernt werden.</label>
        <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
        <button type="submit" style={{ background: "#01223F", color: "#fff", border: 0, borderRadius: 999, padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}>Profil jetzt entfernen</button>
      </form>
      <p style={{ marginTop: 24 }}><a href={"/" + p.slug} style={{ textDecoration: "underline" }}>Zurück zum Profil</a></p>
    </main>
  );
}
