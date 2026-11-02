# Outreach-Mails (Entwürfe zur Freigabe durch Robert – werden NICHT automatisch versendet)

Ablauf (Tage ab Aktivierungsmail = Tag 0, nur solange keine Reaktion = bestätigt/claimed, ausgeblendet oder gelöscht):

| Tag | Mail | Datei |
|----|------|-------|
| 0  | Aktivierung (gleichzeitig mit Veröffentlichung des Batches) | 00-aktivierung.md |
| 7  | Erinnerung 1 | 01-erinnerung-1.md |
| 14 | Erinnerung 2 | 02-erinnerung-2.md |
| 21 | Erinnerung 3 (letzte) | 03-erinnerung-3.md |
| ≤28 | Profil automatisch offline + Hinweis | 04-offline-hinweis.md |

Platzhalter: `{{vorname}}`, `{{name}}`, `{{kategorie}}`, `{{profil_url}}` (öffentliche URL), `{{bestaetigen_url}}`
(= /claim/{token}), `{{ausblenden_url}}` (= /profil/ausblenden?token=…), `{{loeschen_url}}`
(= /profil/ausblenden?token=…&status=confirm), `{{anzahl_angebote}}`.
Versand nur über den expliziten Sendeschritt (Resend), danach `mark_outreach_sent(id, 'activation'|'reminder1'…)`.
Absender: Orive <hello@orive.co>. Ein `List-Unsubscribe`-Header zeigt auf `{{ausblenden_url}}`.

HTML + Text: `src/emails/outreach.ts` (`renderOutreachMail(kind, data, 'de')`), Texte in `src/emails/copy.ts` (pro Locale).
Design-Basis: bestehende Test-/Invite-Mail `/workspace/orive-testmail/mail_v4.html` + Teaser `teaser_v4_src.html`.

**List-Unsubscribe**: Der Sendeschritt setzt `List-Unsubscribe: <{{ausblenden_url}}>, <mailto:hello@orive.co?subject=Profil%20ausblenden>` und `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058). Der One-Click-POST des Mailprogramms darf nur ausblenden, nie löschen – dafür muss `/api/profil/ausblenden` beim Senden-Schritt einen POST ohne Same-Origin akzeptieren (offener Punkt, siehe Bericht).

## Patch 0013: Sprachen, Vorteile, Logo
- Absender: `Orive <hello@orive.co>`; Kontakt überall hello@orive.co.
- Sprache pro Facilitator (`src/emails/locale.ts`): Website-Sprache (`<html lang>` / Content-Language) → Land → Englisch.
  Einmal gewählt, gespeichert in `facilitator_outreach.locale` (Migration 20261104, nicht angewendet), damit alle 5 Mails gleichsprachig sind.
- 19 Sprachen in `src/emails/locales.ts`: de en nl fr es it pt pl cs sk da sv no fi hu ro el hr sl. Du-Form außer fr/cs/sk/el (Sie-Form).
  Diese Texte sollten vor dem ersten Versand von Muttersprachler:innen gegengelesen werden.
- Opt-out-Seite `/profil/ausblenden` ist ebenfalls lokalisiert (`?lang=` aus der Mail, sonst Accept-Language).
- Logo 40 % kleiner (48 → 29 px).
- Vorteile-Block (`src/emails/features.ts`): Aktivierung = 5 Punkte, Erinnerungen = 3, Offline = eine Zeile. Nur im Code belegte Funktionen:
  | Vorteil | Beleg |
  |---|---|
  | Kostenloses Profil, Servicegebühr zahlt die Kundschaft | `src/lib/payments.ts` (CONCIERGE_FEE_CENTS), `src/lib/settlement.ts` (Betrag = Preis + Gebühr, application_fee), `src/lib/sessionPayments.ts` Schritt 4 |
  | Direkt buchbar, sichere Zahlung über Stripe | `src/app/api/session-bookings/checkout`, `src/lib/sessionPayments.ts`, Auszahlung `src/app/api/facilitator/connect` (Stripe Connect) |
  | Du bestätigst jede Buchung | `src/lib/sessionPayments.ts` Schritt 3, `src/app/api/facilitator/session-bookings/[bookingId]` |
  | Texte, Preise, Angebote, Bilder selbst ändern | `src/app/api/claim/offers/[offerId]` (PATCH), `src/app/api/claim/media`, `src/app/api/claim/products` |
  | Eigene Profilseite + Angebote in Kategorie-Übersichten | `src/lib/claim/slugs.ts` (orive.co/<kategorie>/<name>), `src/app/[username]/angebote` (Patch 0011) |
  Bewusst NICHT genannt (nicht im Code): Bewertungen, Reichweite/Besucherzahlen, Ranking.
- One-Click-Abmeldung (RFC 8058): `List-Unsubscribe` zeigt auf `/api/profil/ausblenden?token=…`; dieser Endpunkt nimmt den
  `List-Unsubscribe=One-Click`-POST ohne Origin-Prüfung an (nur Rate-Limit), blendet nur aus und löscht nie.
