import type { Locale } from "./locales";

/**
 * Orive benefits shown in every outreach mail. ONLY features that exist in the repo (verified, see docs/outreach-mails/README.md):
 *  free      – no fee for the facilitator; the platform fee is added on top for the client (payments.ts CONCIERGE_FEE_CENTS, settlement.ts price+fee, application_fee)
 *  book      – clients book + pay securely via Stripe, payout via Stripe Connect (sessionPayments.ts, api/session-bookings/checkout, api/facilitator/connect)
 *  control   – facilitator confirms every booking; free cancellation up to 24 h before (sessionPayments.ts step 3, api/session-bookings/[id]/cancel)
 *  edit      – edit texts, prices, offers, photos, products yourself (api/claim/offers/[offerId] PATCH, api/claim/media, api/claim/products)
 *  found     – own profile page orive.co/<category>/<name> + offers in category overviews by type (lib/claim/slugs.ts, app/[username]/angebote)
 * Not claimed (not in code): reviews, ratings, reach/visitor numbers, SEO rankings.
 */
export type FeatureKey = "free" | "book" | "control" | "edit" | "found";
export const FEATURE_ORDER: FeatureKey[] = ["free", "book", "control", "edit", "found"];
export const COMPACT: FeatureKey[] = ["free", "book", "edit"];
export const FEATURE_ICON: Record<FeatureKey, string> = { free: "&#9825;", book: "&#10003;", control: "&#9673;", edit: "&#9998;", found: "&#9906;" };
type F = { title: string; items: Record<FeatureKey, [string, string]>; offline: string };

export const FEATURES: Record<Locale, F> = {
  de: { title: "Was Orive für dich tut", offline: "Orive bleibt für dich offen: kostenloses Profil, direkte Buchungen, du behältst die Kontrolle.", items: {
    free: ["Kostenloses Profil", "Keine Grundgebühr. Die Servicegebühr zahlt deine Kundschaft."],
    book: ["Direkt buchbar", "Kund:innen buchen und bezahlen sicher über Stripe."],
    control: ["Du entscheidest", "Du bestätigst jede Buchung selbst."],
    edit: ["Alles selbst anpassen", "Texte, Preise, Angebote und Bilder jederzeit ändern."],
    found: ["Gefunden werden", "Eigene Profilseite und deine Angebote in den {kategorie}-Übersichten."] } },
  en: { title: "What Orive does for you", offline: "Orive stays open to you: free profile, direct bookings, you stay in control.", items: {
    free: ["Free profile", "No base fee. The service fee is paid by your clients."],
    book: ["Bookable directly", "Clients book and pay securely via Stripe."],
    control: ["You decide", "You confirm every booking yourself."],
    edit: ["Edit everything", "Change texts, prices, offers and photos any time."],
    found: ["Get found", "Your own profile page and your offers in the {kategorie} listings."] } },
  nl: { title: "Wat Orive voor je doet", offline: "Orive blijft voor je open: gratis profiel, directe boekingen, jij houdt de regie.", items: {
    free: ["Gratis profiel", "Geen vaste kosten. De servicekosten betaalt je klant."],
    book: ["Direct te boeken", "Klanten boeken en betalen veilig via Stripe."],
    control: ["Jij beslist", "Je bevestigt elke boeking zelf."],
    edit: ["Alles zelf aanpassen", "Teksten, prijzen, aanbod en foto's altijd wijzigen."],
    found: ["Gevonden worden", "Een eigen profielpagina en je aanbod in de {kategorie}-overzichten."] } },
  fr: { title: "Ce qu'Orive fait pour vous", offline: "Orive reste ouvert pour vous : profil gratuit, réservations directes, vous gardez la main.", items: {
    free: ["Profil gratuit", "Aucun abonnement. Les frais de service sont payés par vos clients."],
    book: ["Réservable directement", "Vos clients réservent et paient en toute sécurité via Stripe."],
    control: ["Vous décidez", "Vous confirmez vous-même chaque réservation."],
    edit: ["Tout modifier vous-même", "Textes, tarifs, offres et photos, à tout moment."],
    found: ["Être trouvé", "Votre propre page de profil et vos offres dans les listes {kategorie}."] } },
  es: { title: "Lo que Orive hace por ti", offline: "Orive sigue abierto para ti: perfil gratuito, reservas directas y tú tienes el control.", items: {
    free: ["Perfil gratuito", "Sin cuota fija. La tarifa de servicio la paga tu cliente."],
    book: ["Reservas directas", "Tus clientes reservan y pagan de forma segura con Stripe."],
    control: ["Tú decides", "Cada reserva la confirmas tú."],
    edit: ["Todo a tu manera", "Cambia textos, precios, ofertas y fotos cuando quieras."],
    found: ["Que te encuentren", "Tu propia página de perfil y tus ofertas en los listados de {kategorie}."] } },
  it: { title: "Cosa fa Orive per te", offline: "Orive resta aperto per te: profilo gratuito, prenotazioni dirette, il controllo resta tuo.", items: {
    free: ["Profilo gratuito", "Nessun canone. La commissione di servizio la paga il cliente."],
    book: ["Prenotabile direttamente", "I clienti prenotano e pagano in sicurezza con Stripe."],
    control: ["Decidi tu", "Confermi tu ogni prenotazione."],
    edit: ["Modifichi tutto tu", "Testi, prezzi, offerte e foto, in qualsiasi momento."],
    found: ["Farti trovare", "La tua pagina profilo e le tue offerte negli elenchi {kategorie}."] } },
  pt: { title: "O que a Orive faz por ti", offline: "A Orive continua aberta para ti: perfil gratuito, reservas diretas e o controlo é teu.", items: {
    free: ["Perfil gratuito", "Sem mensalidade. A taxa de serviço é paga pelo cliente."],
    book: ["Reservas diretas", "Os clientes reservam e pagam em segurança com a Stripe."],
    control: ["Tu decides", "Confirmas tu cada reserva."],
    edit: ["Tudo à tua medida", "Altera textos, preços, ofertas e fotos quando quiseres."],
    found: ["Deixa-te encontrar", "A tua página de perfil e as tuas ofertas nas listas de {kategorie}."] } },
  pl: { title: "Co daje Ci Orive", offline: "Orive nadal stoi przed Tobą otworem: darmowy profil, bezpośrednie rezerwacje, pełna kontrola.", items: {
    free: ["Darmowy profil", "Bez abonamentu. Opłatę serwisową płaci klient."],
    book: ["Bezpośrednie rezerwacje", "Klienci rezerwują i płacą bezpiecznie przez Stripe."],
    control: ["Ty decydujesz", "Każdą rezerwację potwierdzasz samodzielnie."],
    edit: ["Wszystko pod Twoją kontrolą", "Teksty, ceny, oferty i zdjęcia – w każdej chwili."],
    found: ["Daj się znaleźć", "Własna strona profilu i Twoje oferty w zestawieniach {kategorie}."] } },
  cs: { title: "Co pro vás Orive dělá", offline: "Orive je pro vás stále otevřené: profil zdarma, přímé rezervace, kontrola zůstává u vás.", items: {
    free: ["Profil zdarma", "Žádný paušál. Servisní poplatek platí klient."],
    book: ["Přímé rezervace", "Klienti rezervují a platí bezpečně přes Stripe."],
    control: ["Rozhodujete vy", "Každou rezervaci potvrzujete sami."],
    edit: ["Vše upravíte sami", "Texty, ceny, nabídky i fotky kdykoli."],
    found: ["Buďte k nalezení", "Vlastní profilová stránka a vaše nabídky v přehledech {kategorie}."] } },
  sk: { title: "Čo pre vás Orive robí", offline: "Orive je pre vás stále otvorené: profil zadarmo, priame rezervácie, kontrola zostáva u vás.", items: {
    free: ["Profil zadarmo", "Žiadny paušál. Servisný poplatok platí klient."],
    book: ["Priame rezervácie", "Klienti rezervujú a platia bezpečne cez Stripe."],
    control: ["Rozhodujete vy", "Každú rezerváciu potvrdzujete sami."],
    edit: ["Všetko upravíte sami", "Texty, ceny, ponuky aj fotky kedykoľvek."],
    found: ["Buďte nájdení", "Vlastná profilová stránka a vaše ponuky v prehľadoch {kategorie}."] } },
  da: { title: "Det gør Orive for dig", offline: "Orive står stadig åbent for dig: gratis profil, direkte bookinger, du har styringen.", items: {
    free: ["Gratis profil", "Intet fast gebyr. Servicegebyret betales af dine kunder."],
    book: ["Direkte booking", "Kunder booker og betaler sikkert via Stripe."],
    control: ["Du bestemmer", "Du bekræfter selv hver booking."],
    edit: ["Tilpas alt selv", "Tekster, priser, tilbud og billeder når som helst."],
    found: ["Bliv fundet", "Din egen profilside og dine tilbud i {kategorie}-oversigterne."] } },
  sv: { title: "Det här gör Orive för dig", offline: "Orive står fortfarande öppet för dig: gratis profil, direkta bokningar, du har kontrollen.", items: {
    free: ["Gratis profil", "Ingen fast avgift. Serviceavgiften betalas av dina kunder."],
    book: ["Direktbokning", "Kunder bokar och betalar tryggt via Stripe."],
    control: ["Du bestämmer", "Du bekräftar själv varje bokning."],
    edit: ["Ändra allt själv", "Texter, priser, erbjudanden och bilder när du vill."],
    found: ["Bli hittad", "Din egen profilsida och dina erbjudanden i {kategorie}-översikterna."] } },
  no: { title: "Dette gjør Orive for deg", offline: "Orive står fortsatt åpent for deg: gratis profil, direkte bestillinger, du har kontrollen.", items: {
    free: ["Gratis profil", "Ingen fast avgift. Serviceavgiften betales av kundene dine."],
    book: ["Direkte bestilling", "Kunder bestiller og betaler trygt via Stripe."],
    control: ["Du bestemmer", "Du bekrefter selv hver bestilling."],
    edit: ["Endre alt selv", "Tekster, priser, tilbud og bilder når som helst."],
    found: ["Bli funnet", "Din egen profilside og tilbudene dine i {kategorie}-oversiktene."] } },
  fi: { title: "Mitä Orive tekee puolestasi", offline: "Orive on sinulle yhä avoinna: maksuton profiili, suorat varaukset, päätösvalta pysyy sinulla.", items: {
    free: ["Maksuton profiili", "Ei kuukausimaksua. Palvelumaksun maksaa asiakas."],
    book: ["Suorat varaukset", "Asiakkaat varaavat ja maksavat turvallisesti Stripen kautta."],
    control: ["Sinä päätät", "Vahvistat jokaisen varauksen itse."],
    edit: ["Muokkaa kaikkea itse", "Tekstit, hinnat, tarjoukset ja kuvat milloin vain."],
    found: ["Tule löydetyksi", "Oma profiilisivu ja tarjouksesi {kategorie}-listauksissa."] } },
  hu: { title: "Amit az Orive nyújt neked", offline: "Az Orive továbbra is nyitva áll előtted: ingyenes profil, közvetlen foglalások, minden a te kezedben.", items: {
    free: ["Ingyenes profil", "Nincs alapdíj. A szolgáltatási díjat az ügyfél fizeti."],
    book: ["Közvetlen foglalás", "Az ügyfelek biztonságosan foglalnak és fizetnek a Stripe-on keresztül."],
    control: ["Te döntesz", "Minden foglalást te erősítesz meg."],
    edit: ["Mindent te alakítasz", "Szövegek, árak, ajánlatok és képek bármikor."],
    found: ["Találjanak meg", "Saját profiloldal és az ajánlataid a {kategorie}-listákban."] } },
  ro: { title: "Ce face Orive pentru tine", offline: "Orive rămâne deschis pentru tine: profil gratuit, rezervări directe, controlul rămâne la tine.", items: {
    free: ["Profil gratuit", "Fără abonament. Taxa de serviciu o plătește clientul."],
    book: ["Rezervări directe", "Clienții rezervă și plătesc în siguranță prin Stripe."],
    control: ["Tu decizi", "Confirmi tu fiecare rezervare."],
    edit: ["Totul după tine", "Texte, prețuri, oferte și fotografii, oricând."],
    found: ["Să te găsească lumea", "Pagina ta de profil și ofertele tale în listele de {kategorie}."] } },
  el: { title: "Τι κάνει το Orive για εσάς", offline: "Το Orive παραμένει ανοιχτό για εσάς: δωρεάν προφίλ, απευθείας κρατήσεις, εσείς έχετε τον έλεγχο.", items: {
    free: ["Δωρεάν προφίλ", "Χωρίς πάγια χρέωση. Την προμήθεια υπηρεσίας την πληρώνει ο πελάτης."],
    book: ["Απευθείας κρατήσεις", "Οι πελάτες κάνουν κράτηση και πληρώνουν με ασφάλεια μέσω Stripe."],
    control: ["Εσείς αποφασίζετε", "Επιβεβαιώνετε μόνοι σας κάθε κράτηση."],
    edit: ["Όλα όπως τα θέλετε", "Κείμενα, τιμές, προσφορές και φωτογραφίες, οποτεδήποτε."],
    found: ["Να σας βρίσκουν", "Δική σας σελίδα προφίλ και οι προσφορές σας στις λίστες {kategorie}."] } },
  hr: { title: "Što Orive radi za tebe", offline: "Orive ti ostaje otvoren: besplatan profil, izravne rezervacije, kontrola je tvoja.", items: {
    free: ["Besplatan profil", "Bez pretplate. Naknadu za uslugu plaća klijent."],
    book: ["Izravne rezervacije", "Klijenti rezerviraju i plaćaju sigurno preko Stripea."],
    control: ["Ti odlučuješ", "Svaku rezervaciju potvrđuješ ti."],
    edit: ["Sve prilagodi po svom", "Tekstovi, cijene, ponude i fotografije, bilo kada."],
    found: ["Neka te pronađu", "Vlastita stranica profila i tvoje ponude u {kategorie} pregledima."] } },
  sl: { title: "Kaj Orive naredi zate", offline: "Orive ostaja odprt zate: brezplačen profil, neposredne rezervacije, nadzor ostane pri tebi.", items: {
    free: ["Brezplačen profil", "Brez naročnine. Storitveno provizijo plača stranka."],
    book: ["Neposredne rezervacije", "Stranke rezervirajo in plačajo varno prek Stripa."],
    control: ["Ti odločaš", "Vsako rezervacijo potrdiš ti."],
    edit: ["Vse po svoje", "Besedila, cene, ponudbe in fotografije kadarkoli."],
    found: ["Naj te najdejo", "Lastna stran profila in tvoje ponudbe v pregledih {kategorie}."] } },
};
