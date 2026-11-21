/**
 * Impressum (§ 5 DDG / § 18 Abs. 2 MStV) – single source of truth.
 * Data approved by Robert on 2026-11-10 (same details as in AGB/Datenschutz). Nothing here is inferred.
 * Optional fields (telefon, ustId, register, verantwortlichMStV, rechtsform) stay null and are omitted on the page.
 * IMPRESSUM_READY flips automatically once all required fields are filled.
 * IMPRESSUM_PREVIEW shows the structured draft with marked gaps (staging only).
 */
export type ImpressumData = {
  /** Name of the provider: natural person or company name */
  anbieterName: string | null;
  /** Owner of a sole proprietorship (Inhaber) */
  inhaber: string | null;
  /** Legal form, e.g. Einzelunternehmen, UG (haftungsbeschränkt), GmbH */
  rechtsform: string | null;
  /** Representative(s) – required for legal entities (Geschäftsführer/in) */
  vertretenDurch: string | null;
  strasse: string | null;
  plzOrt: string | null;
  land: string | null;
  email: string | null;
  /** Second fast contact channel (phone or contact form) – required in practice by § 5 Abs. 1 Nr. 2 DDG */
  telefon: string | null;
  /** Only if registered: Handelsregister, Registergericht, Registernummer */
  register: string | null;
  /** Only if one exists: USt-IdNr. (§ 27a UStG) / Wirtschafts-ID */
  ustId: string | null;
  /** Responsible for editorial content (§ 18 Abs. 2 MStV): name + address */
  verantwortlichMStV: string | null;
};

export const IMPRESSUM: ImpressumData = {
  anbieterName: "heybotti",
  inhaber: "Robert Linke",
  rechtsform: null,
  vertretenDurch: null,
  strasse: "Stiftsgasse 17",
  plzOrt: "07407 Rudolstadt",
  land: "Deutschland",
  email: "robert.linke@me.com",
  telefon: null,
  register: null,
  ustId: null,
  verantwortlichMStV: null,
};

const REQUIRED: (keyof ImpressumData)[] = ["anbieterName", "inhaber", "strasse", "plzOrt", "land", "email"];

export const IMPRESSUM_MISSING = REQUIRED.filter((k) => !IMPRESSUM[k]);
export const IMPRESSUM_READY = IMPRESSUM_MISSING.length === 0;
export const IMPRESSUM_PREVIEW = false;
