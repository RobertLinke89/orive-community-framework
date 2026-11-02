#!/usr/bin/env node
/** Seed + MyMemory fill for European locale catalogs. */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, "src/i18n/en-sources.json"), "utf8"));
const OUT_DIR = path.join(ROOT, "src/i18n/catalogs");
const TARGETS = ["bg","cs","da","el","es","et","fi","fr","ga","hr","hu","is","it","lt","lv","mt","nl","no","pl","pt","ro","sk","sl","sv","uk"];

/** High-traffic UI seeds (EN -> locale). Generated for ORIVE chrome. */
const SEED = {
  "Explore & Book": { fr:"Explorer et réserver", es:"Explorar y reservar", it:"Esplora e prenota", nl:"Ontdekken en boeken", pl:"Odkrywaj i rezerwuj", pt:"Explorar e reservar", sv:"Utforska och boka", da:"Udforsk og book", fi:"Tutustu ja varaa", el:"Εξερεύνηση και κράτηση", cs:"Prozkoumat a rezervovat", ro:"Explorează și rezervă", hu:"Fedezd fel és foglalj", sk:"Preskúmať a rezervovať", sl:"Razišči in rezerviraj", hr:"Istraži i rezerviraj", bg:"Разгледай и резервирай", et:"Sirvi ja broneeri", lv:"Izpēti un rezervē", lt:"Naršyti ir rezervuoti", mt:"Esplora u ibbukkja", ga:"Déan iniúchadh agus áirithint", is:"Skoða og bóka", no:"Utforsk og book", uk:"Огляд і бронювання" },
  "Marketplace Directory": { fr:"Annuaire du marché", es:"Directorio del marketplace", it:"Directory del marketplace", nl:"Marktplaats-overzicht", pl:"Katalog marketplace", pt:"Diretório do marketplace", sv:"Marknadsplats", da:"Markedsplads", fi:"Markkinapaikka", el:"Κατάλογος αγορών", cs:"Adresář marketplace", ro:"Director marketplace", hu:"Piactér", sk:"Adresár marketplace", sl:"Imenik tržnice", hr:"Imenik tržnice", bg:"Пазарна директория", et:"Turukataloog", lv:"Tirgus katalogs", lt:"Rinkos katalogas", mt:"Direttorju tas-suq", ga:"Eolaire an mhargaidh", is:"Markaðsskrá", no:"Markedsplass", uk:"Каталог маркетплейсу" },
  "1:1 Private Sessions": { fr:"Séances individuelles 1:1", es:"Sesiones privadas 1:1", it:"Sessioni private 1:1", nl:"1:1 privésessies", pl:"Sesje prywatne 1:1", pt:"Sessões privadas 1:1", sv:"Privata 1:1-sessioner", da:"Private 1:1-sessioner", fi:"Yksityiset 1:1-sessiot", el:"Ατομικές συνεδρίες 1:1", cs:"Individuální sezení 1:1", ro:"Sesiuni private 1:1", hu:"1:1 privát ülések", sk:"Individuálne sedenia 1:1", sl:"Zasebne seje 1:1", hr:"Privatne sesije 1:1", bg:"Частни сесии 1:1", et:"Privaatsed 1:1 sessioonid", lv:"Privātās 1:1 sesijas", lt:"Privatūs 1:1 seansai", mt:"Sessjonijiet privati 1:1", ga:"Seisiúin phríobháideacha 1:1", is:"Einkatímar 1:1", no:"Private 1:1-økter", uk:"Приватні сесії 1:1" },
  "For Facilitators": { fr:"Pour les facilitateurs", es:"Para facilitadores", it:"Per i facilitator", nl:"Voor facilitators", pl:"Dla facilitatorów", pt:"Para facilitadores", sv:"För facilitatorer", da:"For facilitatorer", fi:"Fasilitaattoreille", el:"Για facilitators", cs:"Pro facilitátory", ro:"Pentru facilitatori", hu:"Facilitátoroknak", sk:"Pre facilitátorov", sl:"Za facilitatorje", hr:"Za facilitatore", bg:"За фасилитатори", et:"Fasilitaatoritele", lv:"Facilitatoriem", lt:"Facilitatoriams", mt:"Għall-facilitators", ga:"Do éascaitheoirí", is:"Fyrir leiðbeinendur", no:"For fasilitatorer", uk:"Для фасилітаторів" },
  "Terms of use": { fr:"Conditions d'utilisation", es:"Condiciones de uso", it:"Termini di utilizzo", nl:"Gebruiksvoorwaarden", pl:"Warunki korzystania", pt:"Termos de utilização", sv:"Användarvillkor", da:"Brugsvilkår", fi:"Käyttöehdot", el:"Όροι χρήσης", cs:"Podmínky použití", ro:"Termeni de utilizare", hu:"Felhasználási feltételek", sk:"Podmienky používania", sl:"Pogoji uporabe", hr:"Uvjeti korištenja", bg:"Условия за ползване", et:"Kasutustingimused", lv:"Lietošanas noteikumi", lt:"Naudojimo sąlygos", mt:"Termini tal-użu", ga:"Téarmaí úsáide", is:"Notkunarskilmálar", no:"Bruksvilkår", uk:"Умови використання" },
  "Privacy Policy": { fr:"Politique de confidentialité", es:"Política de privacidad", it:"Informativa sulla privacy", nl:"Privacybeleid", pl:"Polityka prywatności", pt:"Política de privacidade", sv:"Integritetspolicy", da:"Privatlivspolitik", fi:"Tietosuojakäytäntö", el:"Πολιτική απορρήτου", cs:"Zásady ochrany osobních údajů", ro:"Politica de confidențialitate", hu:"Adatvédelmi irányelvek", sk:"Zásady ochrany súkromia", sl:"Pravilnik o zasebnosti", hr:"Pravila privatnosti", bg:"Политика за поверителност", et:"Privaatsuspoliitika", lv:"Privātuma politika", lt:"Privatumo politika", mt:"Politika tal-privatezza", ga:"Beartas príobháideachais", is:"Persónuverndarstefna", no:"Personvernerklæring", uk:"Політика конфіденційності" },
  "Privacy": { fr:"Confidentialité", es:"Privacidad", it:"Privacy", nl:"Privacy", pl:"Prywatność", pt:"Privacidade", sv:"Integritet", da:"Privatliv", fi:"Tietosuoja", el:"Απόρρητο", cs:"Soukromí", ro:"Confidențialitate", hu:"Adatvédelem", sk:"Súkromie", sl:"Zasebnost", hr:"Privatnost", bg:"Поверителност", et:"Privaatsus", lv:"Privātums", lt:"Privatumas", mt:"Privatezza", ga:"Príobháideachas", is:"Persónuvernd", no:"Personvern", uk:"Конфіденційність" },
  "Terms": { fr:"Conditions", es:"Términos", it:"Termini", nl:"Voorwaarden", pl:"Warunki", pt:"Termos", sv:"Villkor", da:"Vilkår", fi:"Ehdot", el:"Όροι", cs:"Podmínky", ro:"Termeni", hu:"Feltételek", sk:"Podmienky", sl:"Pogoji", hr:"Uvjeti", bg:"Условия", et:"Tingimused", lv:"Noteikumi", lt:"Sąlygos", mt:"Termini", ga:"Téarmaí", is:"Skilmálar", no:"Vilkår", uk:"Умови" },
  "Get started free": { fr:"Commencer gratuitement", es:"Empieza gratis", it:"Inizia gratis", nl:"Gratis starten", pl:"Zacznij za darmo", pt:"Começar grátis", sv:"Kom igång gratis", da:"Kom i gang gratis", fi:"Aloita ilmaiseksi", el:"Ξεκινήστε δωρεάν", cs:"Začněte zdarma", ro:"Începe gratuit", hu:"Kezdd el ingyen", sk:"Začať zadarmo", sl:"Začni brezplačno", hr:"Započni besplatno", bg:"Започни безплатно", et:"Alusta tasuta", lv:"Sāc bez maksas", lt:"Pradėkite nemokamai", mt:"Ibda b'xejn", ga:"Tosaigh saor in aisce", is:"Byrjaðu ókeypis", no:"Kom i gang gratis", uk:"Почати безкоштовно" },
  "Search": { fr:"Rechercher", es:"Buscar", it:"Cerca", nl:"Zoeken", pl:"Szukaj", pt:"Pesquisar", sv:"Sök", da:"Søg", fi:"Haku", el:"Αναζήτηση", cs:"Hledat", ro:"Căutare", hu:"Keresés", sk:"Hľadať", sl:"Iskanje", hr:"Pretraži", bg:"Търсене", et:"Otsi", lv:"Meklēt", lt:"Ieškoti", mt:"Fittex", ga:"Cuardaigh", is:"Leita", no:"Søk", uk:"Пошук" },
  "Where": { fr:"Où", es:"Dónde", it:"Dove", nl:"Waar", pl:"Gdzie", pt:"Onde", sv:"Var", da:"Hvor", fi:"Missä", el:"Πού", cs:"Kde", ro:"Unde", hu:"Hol", sk:"Kde", sl:"Kje", hr:"Gdje", bg:"Къде", et:"Kus", lv:"Kur", lt:"Kur", mt:"Fejn", ga:"Cá", is:"Hvar", no:"Hvor", uk:"Де" },
  "When": { fr:"Quand", es:"Cuándo", it:"Quando", nl:"Wanneer", pl:"Kiedy", pt:"Quando", sv:"När", da:"Hvornår", fi:"Milloin", el:"Πότε", cs:"Kdy", ro:"Când", hu:"Mikor", sk:"Kedy", sl:"Kdaj", hr:"Kada", bg:"Кога", et:"Millal", lv:"Kad", lt:"Kada", mt:"Meta", ga:"Cathain", is:"Hvenær", no:"Når", uk:"Коли" },
  "What": { fr:"Quoi", es:"Qué", it:"Cosa", nl:"Wat", pl:"Co", pt:"O quê", sv:"Vad", da:"Hvad", fi:"Mitä", el:"Τι", cs:"Co", ro:"Ce", hu:"Mit", sk:"Čo", sl:"Kaj", hr:"Što", bg:"Какво", et:"Mis", lv:"Kas", lt:"Kas", mt:"Xiex", ga:"Cad", is:"Hvað", no:"Hva", uk:"Що" },
  "Clear": { fr:"Effacer", es:"Borrar", it:"Cancella", nl:"Wissen", pl:"Wyczyść", pt:"Limpar", sv:"Rensa", da:"Ryd", fi:"Tyhjennä", el:"Καθαρισμός", cs:"Vymazat", ro:"Șterge", hu:"Törlés", sk:"Vymazať", sl:"Počisti", hr:"Očisti", bg:"Изчисти", et:"Tühjenda", lv:"Notīrīt", lt:"Išvalyti", mt:"Neħħi", ga:"Glan", is:"Hreinsa", no:"Tøm", uk:"Очистити" },
  "Today": { fr:"Aujourd'hui", es:"Hoy", it:"Oggi", nl:"Vandaag", pl:"Dziś", pt:"Hoje", sv:"Idag", da:"I dag", fi:"Tänään", el:"Σήμερα", cs:"Dnes", ro:"Azi", hu:"Ma", sk:"Dnes", sl:"Danes", hr:"Danas", bg:"Днес", et:"Täna", lv:"Šodien", lt:"Šiandien", mt:"Illum", ga:"Inniu", is:"Í dag", no:"I dag", uk:"Сьогодні" },
  "Language": { fr:"Langue", es:"Idioma", it:"Lingua", nl:"Taal", pl:"Język", pt:"Idioma", sv:"Språk", da:"Sprog", fi:"Kieli", el:"Γλώσσα", cs:"Jazyk", ro:"Limbă", hu:"Nyelv", sk:"Jazyk", sl:"Jezik", hr:"Jezik", bg:"Език", et:"Keel", lv:"Valoda", lt:"Kalba", mt:"Lingwa", ga:"Teanga", is:"Tungumál", no:"Språk", uk:"Мова" },
  "A heybotti brand": { fr:"Une marque heybotti", es:"Una marca de heybotti", it:"Un marchio heybotti", nl:"Een heybotti-merk", pl:"Marka heybotti", pt:"Uma marca heybotti", sv:"Ett heybotti-varumärke", da:"Et heybotti-brand", fi:"heybotti-brändi", el:"Μάρκα heybotti", cs:"Značka heybotti", ro:"Un brand heybotti", hu:"heybotti márka", sk:"Značka heybotti", sl:"Blagovna znamka heybotti", hr:"heybotti marka", bg:"Марка heybotti", et:"heybotti bränd", lv:"heybotti zīmols", lt:"heybotti prekės ženklas", mt:"Brand heybotti", ga:"Branda heybotti", is:"heybotti vörumerki", no:"Et heybotti-merke", uk:"Бренд heybotti" },
  "Booking & payment": { fr:"Réservation et paiement", es:"Reserva y pago", it:"Prenotazione e pagamento", nl:"Boeken & betalen", pl:"Rezerwacja i płatność", pt:"Reserva e pagamento", sv:"Bokning och betalning", da:"Booking og betaling", fi:"Varaus ja maksu", el:"Κράτηση και πληρωμή", cs:"Rezervace a platba", ro:"Rezervare și plată", hu:"Foglalás és fizetés", sk:"Rezervácia a platba", sl:"Rezervacija in plačilo", hr:"Rezervacija i plaćanje", bg:"Резервация и плащане", et:"Broneering ja makse", lv:"Rezervācija un maksājums", lt:"Rezervacija ir mokėjimas", mt:"Booking u ħlas", ga:"Áirithint agus íocaíocht", is:"Bókun og greiðsla", no:"Booking og betaling", uk:"Бронювання та оплата" },
  "All offerings": { fr:"Toutes les offres", es:"Todas las ofertas", it:"Tutte le offerte", nl:"Alle aanbiedingen", pl:"Wszystkie oferty", pt:"Todas as ofertas", sv:"Alla erbjudanden", da:"Alle tilbud", fi:"Kaikki tarjoukset", el:"Όλες οι προσφορές", cs:"Všechny nabídky", ro:"Toate ofertele", hu:"Minden ajánlat", sk:"Všetky ponuky", sl:"Vse ponudbe", hr:"Sve ponude", bg:"Всички предложения", et:"Kõik pakkumised", lv:"Visi piedāvājumi", lt:"Visi pasiūlymai", mt:"L-offerti kollha", ga:"Gach tairiscint", is:"Öll tilboð", no:"Alle tilbud", uk:"Усі пропозиції" },
  "See all categories": { fr:"Voir toutes les catégories", es:"Ver todas las categorías", it:"Vedi tutte le categorie", nl:"Alle categorieën bekijken", pl:"Zobacz wszystkie kategorie", pt:"Ver todas as categorias", sv:"Se alla kategorier", da:"Se alle kategorier", fi:"Näytä kaikki kategoriat", el:"Δείτε όλες τις κατηγορίες", cs:"Zobrazit všechny kategorie", ro:"Vezi toate categoriile", hu:"Összes kategória", sk:"Zobraziť všetky kategórie", sl:"Prikaži vse kategorije", hr:"Prikaži sve kategorije", bg:"Виж всички категории", et:"Näita kõiki kategooriaid", lv:"Skatīt visas kategorijas", lt:"Žiūrėti visas kategorijas", mt:"Ara l-kategoriji kollha", ga:"Féach gach catagóir", is:"Sjá alla flokka", no:"Se alle kategorier", uk:"Усі категорії" },
};

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function myMemory(text, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0,450))}&langpair=en|${to}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out || /MYMEMORY WARNING/i.test(out)) return null;
  return out;
}

async function build(code) {
  const outPath = path.join(OUT_DIR, `${code}.json`);
  const catalog = {};
  for (const en of SOURCES) {
    if (SEED[en]?.[code]) catalog[en] = SEED[en][code];
    else catalog[en] = en; // placeholder until filled
  }
  // Fill missing via MyMemory (skip identity only for short queue)
  let filled = 0;
  for (const en of SOURCES) {
    if (SEED[en]?.[code]) continue;
    if (en.length < 3 || /^[\d\s.:%/€$£+\-–—·]+$/.test(en)) { catalog[en]=en; continue; }
    // Prefer filling high value: titles under 80 chars
    if (en.length > 120) continue;
    try {
      const t = await myMemory(en, code);
      if (t && t !== en) { catalog[en]=t; filled++; }
      await sleep(150);
      if (filled && filled % 25 === 0) {
        fs.writeFileSync(outPath, JSON.stringify(catalog));
        console.log(`${code}: filled ${filled}`);
      }
      if (filled >= 200) break; // daily quota safety
    } catch { /* keep en */ }
  }
  fs.writeFileSync(outPath, JSON.stringify(catalog));
  console.log(`✓ ${code} seeded+filled (${filled} via API)`);
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? only : TARGETS;
  for (const code of list) await build(code);
}
main().catch(e=>{console.error(e);process.exit(1);});
