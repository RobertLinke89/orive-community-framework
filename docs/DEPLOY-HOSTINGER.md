# Deploy auf Hostinger (45.93.138.75) – Notizen (nichts davon ist in diesem Patch ausgeführt)

Die App ist deploy-agnostisch: keine Vercel-spezifischen APIs in den neuen Seiten/Routen.

**Static Export reicht NICHT**: Profile, /{kategorie}/angebote, Angebotsdetails (ISR `revalidate`), `/api/profil/ausblenden`,
`/api/cron/*`, Claim/Stripe brauchen Server-Code -> Hostinger **VPS mit Node.js ≥ 18.17** (kein reines Shared-Webhosting).

1. `npm ci && npm run build && npm run start` (Port 8089) unter pm2/systemd, davor nginx als Reverse Proxy + TLS (Let's Encrypt) für orive.co.
   Optional `output: "standalone"` in next.config für kleinere Deploys (`node .next/standalone/server.js`).
2. Env-Variablen (server-seitig, nie NEXT_PUBLIC_ außer markiert): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, **neu** `CRAWLER_SUPABASE_URL` + `CRAWLER_SUPABASE_SERVICE_KEY` (Projekt apcrvowzrihkpkuwxbhb),
   `NEXT_PUBLIC_APP_URL=https://orive.co`, `CRON_SECRET`, `BOOKING_TOKEN_SECRET`, `INTAKE_ENCRYPTION_KEY`, Stripe-, Resend-, Turnstile-Keys wie bisher.
3. Cron ohne Vercel: crontab auf dem Server, z. B. täglich 07:15 (Europe/Berlin)
   `curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://orive.co/api/cron/outreach` (Dry-Run, liefert fällige Erinnerungen)
   Auto-Offline erst nach Freigabe: `...?apply=unpublish`. Bestehender `/api/cron/settle` ebenso per crontab.
   Alternative: Supabase pg_cron + pg_net (Snippet am Ende der Migration).
4. ISR-Cache liegt bei `next start` im Dateisystem (.next/cache) -> Verzeichnis beschreibbar und bei mehreren Instanzen nicht geteilt.
5. Rate-Limits (`rateLimitShared`) prüfen, ob sie einen Vercel-KV/Upstash-Store voraussetzen; sonst gilt nur der In-Memory-Fallback pro Prozess.
6. `x-forwarded-for`/`host` von nginx korrekt durchreichen (Same-Origin-Check, clientIp).
