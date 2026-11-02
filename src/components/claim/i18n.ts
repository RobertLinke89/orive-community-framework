export type Lang = "de" | "en";
const DE_COUNTRIES = ["germany", "deutschland", "austria", "österreich", "switzerland", "schweiz"];
export const langFor = (country?: string | null): Lang => (DE_COUNTRIES.includes(String(country || "").trim().toLowerCase()) ? "de" : "en");

export const T = {
  de: {
    draftBanner: "Vorschau – dieses Profil ist noch nicht öffentlich und wird nicht von Suchmaschinen erfasst.",
    example: "Beispiel", offers: "Angebote", noOffers: "Noch keine Angebote", noOffersHint: "Hier erscheinen bald buchbare Sessions.", gallery: "Eindrücke", products: "Produkte", showAll: "Alle {n} Bilder", close: "Schließen", prev: "Vorheriges Bild", next: "Nächstes Bild", toProduct: "Zum Produkt", book: "Termin wählen", bookNow: "Termin buchen", fromPrice: "ab {p}", bookHint: "Sicher buchen über Orive", activate: "Jetzt aktivieren",
    activateLead: "Melde dich an, um dein Profil zu übernehmen und live zu schalten. Danach kannst du alle Angebote bearbeiten.",
    google: "Weiter mit Google", apple: "Weiter mit Apple", email: "E-Mail-Adresse", sendLink: "Login-Link senden",
    linkSent: "Prüfe dein Postfach – der Login-Link ist unterwegs.",
    consentNeeded: "Bitte zuerst der Einwilligung zustimmen.",
    optOut: "Das bin nicht ich / Meine Daten löschen", optOutConfirm: "Profilentwurf und alle Daten unwiderruflich löschen?",
    optOutDone: "Erledigt. Wir haben den Entwurf gelöscht und kontaktieren dich nicht erneut.",
    whyHere: "Wir haben öffentlich verfügbare Angaben (Name, Ort, Website) zu einem Entwurf zusammengestellt. Ohne deine Aktivierung wird nichts veröffentlicht.",
    share: "Hier dein Sharing-Link. Bitte teilen jetzt.", copy: "Link kopieren", copied: "Kopiert!", shareBtn: "Teilen",
    live: "Dein Profil ist live!", editOffers: "Angebote bearbeiten", save: "Speichern", del: "Löschen",
    expired: "Dieser Link ist abgelaufen oder wurde bereits verwendet.", invalid: "Dieser Link ist ungültig.",
    alreadyLive: "Dieses Profil wurde bereits aktiviert.", working: "Einen Moment …", error: "Das hat nicht geklappt. Bitte erneut versuchen.",
    online: "Online", in_person: "Vor Ort", hybrid: "Vor Ort & online", min: "Min.", free: "Kostenlos", website: "Website",
    bookingVia: "Buchung über Orive",
    about: "Über mich", editMe: "Entwurf, bitte prüfen", changeCover: "Titelbild ändern",
    goLive: "Live schalten", isLive: "Live", draftState: "Entwurf · nicht öffentlich", liveState: "Öffentlich sichtbar",
    goLiveHint: "Zum Veröffentlichen kurz anmelden:", quality: "Qualität",
  },
  en: {
    draftBanner: "Preview – this profile is not public yet and is not indexed by search engines.",
    example: "Example", offers: "Offers", noOffers: "No offers yet", noOffersHint: "Bookable sessions will appear here soon.", gallery: "Impressions", products: "Products", showAll: "All {n} photos", close: "Close", prev: "Previous photo", next: "Next photo", toProduct: "View product", book: "Pick a time", bookNow: "Book a session", fromPrice: "from {p}", bookHint: "Secure booking via Orive", activate: "Activate now",
    activateLead: "Sign in to claim your profile and publish it. Afterwards you can edit every offer.",
    google: "Continue with Google", apple: "Continue with Apple", email: "Email address", sendLink: "Send login link",
    linkSent: "Check your inbox – your login link is on its way.",
    consentNeeded: "Please accept the consent first.",
    optOut: "This isn't me / Delete my data", optOutConfirm: "Permanently delete this draft and all data?",
    optOutDone: "Done. We deleted the draft and won't contact you again.",
    whyHere: "We compiled publicly available details (name, location, website) into a draft. Nothing is published unless you activate it.",
    share: "Here is your sharing link. Please share it now.", copy: "Copy link", copied: "Copied!", shareBtn: "Share",
    live: "Your profile is live!", editOffers: "Edit offers", save: "Save", del: "Delete",
    expired: "This link has expired or was already used.", invalid: "This link is invalid.",
    alreadyLive: "This profile has already been activated.", working: "One moment …", error: "That didn't work. Please try again.",
    online: "Online", in_person: "In person", hybrid: "In person & online", min: "min", free: "Free", website: "Website",
    bookingVia: "Booking via Orive",
    about: "About", editMe: "Draft, please review", changeCover: "Change cover",
    goLive: "Go live", isLive: "Live", draftState: "Draft · not public", liveState: "Publicly visible",
    goLiveHint: "Sign in quickly to publish:", quality: "Quality",
  },
} as const;
export type Dict = { [K in keyof typeof T.de]: string };
