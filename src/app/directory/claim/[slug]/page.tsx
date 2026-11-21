import { notFound } from "next/navigation";
import { getDirectoryProfile } from "@/lib/directorySample";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const box = { maxWidth: 560, margin: "0 auto", padding: "64px 16px", fontFamily: "Inter, system-ui, sans-serif", color: "#01223F" } as const;
const field = { border: "1px solid #0003", borderRadius: 8, padding: 10, font: "inherit" } as const;
const lbl = { display: "grid", gap: 6, fontSize: 14 } as const;

// Claim request: stored as a pending request in public.directory_claim_requests (POST /api/directory/claim).
// Review and approval are manual (Robert, /admin/anfragen). The claimer gets NO automatic mail;
// only robert.linke@me.com receives an internal notification.
export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams: { done?: string; err?: string; rate?: string } }) {
  const p = await getDirectoryProfile(params.slug);
  if (!p) notFound();
  if (searchParams?.done === "1") {
    return (
      <main style={box}>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Danke – deine Anfrage ist eingegangen</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>{p.name}{p.city ? " · " + p.city : ""}</p>
        <p style={{ marginTop: 20, lineHeight: 1.6 }}>Wir prüfen deine Anfrage und melden uns. Bis dahin bleibt das Profil unverändert. Eine automatische Bestätigungs-E-Mail verschicken wir nicht.</p>
        <p style={{ marginTop: 28 }}><a href={"/" + p.slug} style={{ textDecoration: "underline" }}>Zurück zum Profil</a></p>
      </main>
    );
  }
  return (
    <main style={box}>
      <h1 style={{ fontSize: 26, fontWeight: 600 }}>Das bin ich – Profil übernehmen</h1>
      <p style={{ marginTop: 8, opacity: 0.7 }}>{p.name}{p.city ? " · " + p.city : ""}</p>
      <p style={{ marginTop: 20, lineHeight: 1.6 }}>Ist das deine Praxis oder dein Angebot? Schick uns eine kurze Anfrage. Wir prüfen sie von Hand und melden uns bei dir, bevor sich am Profil etwas ändert.</p>
      {searchParams?.err ? <p style={{ marginTop: 12, color: "#b42318" }}>Bitte fülle Name, E-Mail und einen Nachweis-Link aus und bestätige die Einwilligung.</p> : null}
      {searchParams?.rate ? <p style={{ marginTop: 12, color: "#b42318" }}>Zu viele Anfragen in kurzer Zeit. Bitte versuche es später erneut.</p> : null}
      <form method="post" action="/api/directory/claim" style={{ marginTop: 24, display: "grid", gap: 14 }}>
        <input type="hidden" name="slug" value={p.slug} />
        <input type="hidden" name="ts" value={Date.now()} />
        <label style={lbl}>Name
          <input name="name" required maxLength={120} autoComplete="name" style={field} />
        </label>
        <label style={lbl}>E-Mail
          <input name="email" type="email" required maxLength={254} autoComplete="email" style={field} />
        </label>
        <label style={lbl}>Deine Rolle
          <select name="role" defaultValue="Inhaber/in" style={field}>
            <option>Inhaber/in</option>
            <option>Team / Mitarbeiter/in</option>
            <option>Agentur / Vertretung</option>
            <option>Andere</option>
          </select>
        </label>
        <label style={lbl}>Nachweis (Website, Instagram oder anderes Profil, das dich als Anbieter/in zeigt)
          <input name="proof_url" required maxLength={500} placeholder="https://…" inputMode="url" style={field} />
        </label>
        <label style={lbl}>Nachricht (optional)
          <textarea name="message" maxLength={2000} rows={3} placeholder="z. B. was am Profil korrigiert werden soll" style={field} />
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, lineHeight: 1.5 }}>
          <input type="checkbox" name="consent" value="1" required style={{ marginTop: 4 }} />
          <span>Ich bin einverstanden, dass Orive meine Angaben speichert, um diese Übernahme-Anfrage zu prüfen. Details in der <a href="/datenschutz" style={{ textDecoration: "underline" }}>Datenschutzerklärung</a>.</span>
        </label>
        <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
        <button type="submit" style={{ background: "#017F80", color: "#fff", border: 0, borderRadius: 999, padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}>Übernahme anfragen</button>
      </form>
      <p style={{ marginTop: 28 }}><a href={"/" + p.slug} style={{ textDecoration: "underline" }}>Zurück zum Profil</a> · <a href={"/directory/remove/" + p.slug} style={{ textDecoration: "underline" }}>Profil entfernen</a></p>
    </main>
  );
}
