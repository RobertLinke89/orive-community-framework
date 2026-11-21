// Multilingual vocabulary for the directory AI search (rule-based parser + index synonyms). Pure data, no I/O.
export const CATEGORIES = ["Kambo", "Breathwork", "Ice Bathing", "Sound Healing", "Sauna & Heat", "Personal Coaching", "Mindfulness", "Meditation", "Yoga", "BodyWork", "Spiritual Growth", "Life Coaching"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Synonyms per category (normalized: lowercase, no accents, ß->ss). Multi-word entries allowed. */
export const CAT_SYNONYMS: Record<Category, string[]> = {
  Kambo: ["kambo", "kambô", "sapo", "frog medicine", "froschgift", "frosch medizin", "kambo zeremonie", "kambo ceremony"],
  Breathwork: ["breathwork", "breath work", "atemarbeit", "atemtherapie", "atemtraining", "atemreise", "atemkurs", "atmen", "atmung", "atemubungen", "atemuebungen", "pranayama", "holotropic", "holotropes atmen", "holotrop", "rebirthing", "conscious breathing", "bewusstes atmen", "breathing", "ademwerk", "ademhaling", "adem", "respiration", "respiracion", "respirazione", "breathwork session", "oddech", "andning", "andedraet", "transformational breath", "breath"],
  "Ice Bathing": ["eisbaden", "eisbad", "eisbader", "eis baden", "ice bath", "ice bathing", "icebath", "ice baths", "cold plunge", "cold water", "cold exposure", "kaltwasser", "kaltetraining", "kaelte", "kalte", "kaltbaden", "winterschwimmen", "eisschwimmen", "ijsbad", "ijsbaden", "bain de glace", "bain froid", "bano de hielo", "bagno nel ghiaccio", "isbad", "isbading", "kylbad", "wim hof", "wimhof", "cryo", "coldwater", "eiswasser"],
  "Sound Healing": ["sound healing", "soundhealing", "sound bath", "soundbath", "klangheilung", "klangbad", "klangschale", "klangschalen", "klangmassage", "klangreise", "klangtherapie", "klang", "gong", "gongbad", "gong bath", "singing bowl", "singing bowls", "klankschaal", "klankbad", "klankhealing", "bain sonore", "soin sonore", "bol tibetain", "bano de sonido", "bagno sonoro", "sound journey", "sound meditation", "sound", "lydbad", "ljudbad"],
  "Sauna & Heat": ["sauna", "saunen", "aufguss", "saunaaufguss", "sauna aufguss", "schwitzhutte", "schwitzhuette", "sweat lodge", "dampfbad", "hammam", "banja", "banya", "heat", "warme", "waerme", "infrarot", "infrared"],
  "Personal Coaching": ["coaching", "coach", "personal coaching", "personal coach", "mentoring", "business coaching", "coaching sessions", "persoonlijke coaching", "coaching personnel"],
  Mindfulness: ["mindfulness", "achtsamkeit", "mbsr", "achtsam", "pleine conscience", "atencion plena", "consapevolezza", "aandacht", "mindful", "uwaznosc"],
  Meditation: ["meditation", "meditieren", "meditationen", "meditatie", "meditacion", "meditazione", "meditacja", "vipassana", "zen", "zazen", "silent retreat", "stille", "mediteren", "meditate", "meditationskurs", "meditatie retreat", "meditacao"],
  Yoga: ["yoga", "joga", "yogakurs", "yogakurse", "yogastudio", "yoga studio", "yoga class", "yogalehrer", "yogaschule", "asana", "yoga retreat", "yogaretreat"],
  BodyWork: ["bodywork", "body work", "korperarbeit", "koerperarbeit", "korpertherapie", "massage", "massagen", "massages", "shiatsu", "thai massage", "thaimassage", "osteopathie", "craniosacral", "kraniosakral", "rolfing", "faszien", "fascia", "lichaamswerk", "massage therapy", "masaje", "massaggio", "travail corporel", "feldenkrais", "lomi lomi", "lomilomi", "tuina", "reflexology", "reflexzonen", "fussreflexzonen", "ayurveda massage", "abhyanga"],
  "Spiritual Growth": ["spiritual", "spirituell", "spiritualitat", "spiritualitaet", "spirituality", "spirituelles wachstum", "spiritual growth", "schamanismus", "schamanisch", "shamanic", "shamanism", "sjamanisme", "chamanisme", "cacao", "kakao", "kakaozeremonie", "cacao ceremony", "frauenkreis", "womens circle", "women circle", "mannerkreis", "energy healing", "energiearbeit", "reiki", "tantra", "aura", "chakra", "channeling", "spirituele groei", "developpement spirituel"],
  "Life Coaching": ["life coaching", "life coach", "lebensberatung", "lebenscoaching", "lebenscoach", "coach de vie"],
};

/** Specific practices: narrower than a category. `cats` (optional) is a hard filter, `terms` must match the profile text. */
export type Practice = { id: string; match: string[]; terms: string[]; cats?: Category[] };
export const PRACTICES: Practice[] = [
  { id: "yin", match: ["yin yoga", "yinyoga", "yin"], terms: ["yin"], cats: ["Yoga"] },
  { id: "hatha", match: ["hatha", "hatha yoga"], terms: ["hatha"], cats: ["Yoga"] },
  { id: "vinyasa", match: ["vinyasa", "vinyasa flow"], terms: ["vinyasa"], cats: ["Yoga"] },
  { id: "ashtanga", match: ["ashtanga", "mysore"], terms: ["ashtanga", "mysore"], cats: ["Yoga"] },
  { id: "iyengar", match: ["iyengar"], terms: ["iyengar"], cats: ["Yoga"] },
  { id: "kundalini", match: ["kundalini"], terms: ["kundalini"] },
  { id: "aerial", match: ["aerial yoga", "aerial", "luftyoga"], terms: ["aerial"], cats: ["Yoga"] },
  { id: "prenatal", match: ["schwangerschaftsyoga", "schwangerschaft", "prenatal", "pregnancy", "zwangerschapsyoga", "zwangerschap", "yoga prenatal"], terms: ["schwanger", "prenatal", "pregnan", "zwanger", "prenatal", "postnatal", "mama"] },
  { id: "kids", match: ["kinderyoga", "kids yoga", "yoga fur kinder", "yoga for kids", "kinder", "kids", "children"], terms: ["kinder", "kids", "children", "kind="] },
  { id: "acro", match: ["acroyoga", "acro yoga"], terms: ["acro"] },
  { id: "hot", match: ["hot yoga", "bikram"], terms: ["hot=", "bikram"], cats: ["Yoga"] },
  { id: "reiki", match: ["reiki"], terms: ["reiki"] },
  { id: "tantra", match: ["tantra", "tantric", "tantrisch", "tantramassage", "tantra massage"], terms: ["tantra", "tantric", "tantri"] },
  { id: "cacao", match: ["cacao", "kakao", "kakaozeremonie", "cacao ceremony", "cacaoceremonie", "ceremonie cacao", "kakao zeremonie"], terms: ["cacao", "kakao", "cacau"] },
  { id: "shiatsu", match: ["shiatsu"], terms: ["shiatsu"] },
  { id: "thai", match: ["thai massage", "thaimassage", "thai"], terms: ["thai"] },
  { id: "lomi", match: ["lomi lomi", "lomilomi"], terms: ["lomi"] },
  { id: "craniosacral", match: ["craniosacral", "kraniosakral", "cranio"], terms: ["cranio", "kranio"] },
  { id: "qigong", match: ["qigong", "qi gong", "chi gong", "tai chi", "taichi", "taiji"], terms: ["qigong", "taichi", "taiji", "chigong"] },
  { id: "ecstatic", match: ["ecstatic dance", "ekstatischer tanz", "ekstatic dance", "5rhythms", "5 rhythms", "tanz", "dance"], terms: ["ecstatic", "dance", "tanz", "rhythm", "danse"] },
  { id: "wimhof", match: ["wim hof", "wimhof", "wim hof methode", "wim hof method"], terms: ["wim=", "wimhof"], cats: ["Ice Bathing", "Breathwork"] },
  { id: "holotropic", match: ["holotropic", "holotropes", "holotrop"], terms: ["holotrop"], cats: ["Breathwork"] },
  { id: "gong", match: ["gong", "gongbad", "gong bath"], terms: ["gong"], cats: ["Sound Healing"] },
  { id: "aufguss", match: ["aufguss", "saunaaufguss"], terms: ["aufguss"], cats: ["Sauna & Heat"] },
  { id: "schamanismus", match: ["schamanismus", "schamanisch", "shamanic", "shamanism", "schamane", "shaman", "sjamanisme", "chamanisme", "chamanique"], terms: ["scham", "shaman", "sjaman", "chaman", "chamane"] },
  { id: "frauenkreis", match: ["frauenkreis", "womens circle", "women circle", "women's circle", "frauen", "women", "vrouwen", "femmes"], terms: ["frauen", "women", "woman", "female", "vrouw", "femme", "weiblich", "feminin"] },
  { id: "vipassana", match: ["vipassana"], terms: ["vipassana"] },
  { id: "zen", match: ["zen", "zazen"], terms: ["zen=", "zazen"], cats: ["Meditation", "Mindfulness", "Spiritual Growth"] },
  { id: "mbsr", match: ["mbsr"], terms: ["mbsr"] },
  { id: "ayurveda", match: ["ayurveda", "ayurvedisch", "ayurvedic"], terms: ["ayurved"] },
  { id: "pilates", match: ["pilates"], terms: ["pilates"] },
  { id: "massage", match: ["massage", "massagen", "massages", "masaje", "massaggio"], terms: ["massag", "masaj"], cats: ["BodyWork"] },
  { id: "osteopathie", match: ["osteopathie", "osteopathy", "osteopath"], terms: ["osteopat"] },
  { id: "feldenkrais", match: ["feldenkrais"], terms: ["feldenkrais"] },
  { id: "hammam", match: ["hammam", "dampfbad"], terms: ["hammam", "dampf", "steam"] },
  { id: "sweatlodge", match: ["schwitzhutte", "schwitzhuette", "sweat lodge", "sweatlodge"], terms: ["schwitzh", "sweat", "lodge", "temazcal"] },
  { id: "retreat", match: ["retreat", "retreats", "auszeit", "retraite", "ritiro"], terms: ["retreat", "retraite", "ritiro", "auszeit"] },
  { id: "teacher", match: ["ausbildung", "teacher training", "yogalehrer ausbildung", "ytt", "200h", "lehrer ausbildung", "opleiding", "formation"], terms: ["ausbildung", "teacher", "training", "ytt", "opleiding", "formation", "200="] },
  { id: "somatic", match: ["somatic", "somatisch", "somatische", "somatique"], terms: ["somat"] },
  { id: "online", match: ["online", "zoom", "virtuell", "virtual"], terms: ["online", "zoom", "virtual", "virtuell"] },
];
/** Category words used to match profiles whose name/offer titles mention the category (single words, prefix-safe). */
const CAT_WORD_BLOCK = new Set(["heat", "warme", "waerme", "zen", "sapo", "aura", "stille", "klang", "adem", "kalte", "kaelte", "cryo", "ritual", "rituale", "zeremonie", "ceremony", "coach", "mindful", "achtsam", "aandacht", "breath", "atmen", "atmung", "breathing", "sound", "massage", "massagen", "massages", "chakra", "tantra", "reiki", "cacao", "kakao", "spiritual"]);
export function catWords(c: Category): string[] {
  return [...new Set(CAT_SYNONYMS[c].map((s) => s.replace(/\s+/g, "")).filter((s) => s.length >= 4 && !CAT_WORD_BLOCK.has(s)))];
}
/** Practices whose terms only boost (never hard-filter): generic formats. */
export const SOFT_PRACTICES = new Set(["retreat", "online", "kids", "frauenkreis", "ecstatic", "teacher", "massage", "gong", "wimhof", "aufguss", "somatic"]);

/** Need/symptom words -> categories that plausibly help (used only when no explicit category is given). */
export const NEEDS: { match: string[]; cats: Category[]; terms: string[] }[] = [
  { match: ["stress", "gestresst", "stressed", "anxiety", "angst", "angste", "anxious", "panik", "panic", "nervos", "unruhe", "overwhelmed", "uberfordert", "ueberfordert", "burnout", "burn out", "erschopft", "erschoepft", "exhausted", "relax", "entspannung", "entspannen", "relaxation", "ruhe", "calm", "beruhigen", "spanning", "stres"], cats: ["Breathwork", "Meditation", "Mindfulness", "Yoga"], terms: ["stress", "entspann", "relax", "ruhe", "calm", "burnout", "angst", "anxiety"] },
  { match: ["schlaf", "schlafen", "schlafprobleme", "einschlafen", "sleep", "insomnia", "schlaflos", "slapen", "sommeil", "dormir"], cats: ["Meditation", "Mindfulness", "Yoga", "Sound Healing", "Breathwork"], terms: ["schlaf", "sleep", "slaap", "sommeil", "nidra", "entspann", "relax"] },
  { match: ["ruckenschmerzen", "rueckenschmerzen", "rucken", "ruecken", "back pain", "verspannung", "verspannungen", "schmerzen", "pain", "nacken", "schulter"], cats: ["BodyWork", "Yoga"], terms: ["rucken", "ruecken", "back", "schmerz", "pain", "verspann", "nacken"] },
  { match: ["trauma", "trauer", "grief", "heilung", "healing", "emotional", "emotionen", "emotions"], cats: ["Breathwork", "BodyWork", "Spiritual Growth", "Personal Coaching", "Meditation"], terms: ["trauma", "heal", "heil", "emotion", "trauer", "grief", "somat"] },
  { match: ["immunsystem", "immune", "abhartung", "abhaertung", "energie", "energy", "fokus", "focus", "resilienz", "resilience"], cats: ["Ice Bathing", "Breathwork"], terms: ["immun", "energ", "fokus", "focus", "resilien"] },
  { match: ["lebenskrise", "orientierung", "purpose", "sinn", "career", "karriere", "beruf", "selbstvertrauen", "confidence", "self esteem", "beziehung", "relationship"], cats: ["Personal Coaching", "Life Coaching"], terms: ["krise", "sinn", "purpose", "karriere", "career", "beziehung", "relationship", "selbst", "confidence"] },
];

export const CAT_LABEL: Record<string, Record<Category, string>> = {
  de: { Kambo: "Kambo", Breathwork: "Breathwork", "Ice Bathing": "Eisbaden", "Sound Healing": "Klangheilung", "Sauna & Heat": "Sauna & Wärme", "Personal Coaching": "Coaching", Mindfulness: "Achtsamkeit", Meditation: "Meditation", Yoga: "Yoga", BodyWork: "Körperarbeit", "Spiritual Growth": "Spirituelles Wachstum", "Life Coaching": "Life Coaching" },
  en: { Kambo: "Kambo", Breathwork: "Breathwork", "Ice Bathing": "Ice bathing", "Sound Healing": "Sound healing", "Sauna & Heat": "Sauna & heat", "Personal Coaching": "Coaching", Mindfulness: "Mindfulness", Meditation: "Meditation", Yoga: "Yoga", BodyWork: "Bodywork", "Spiritual Growth": "Spiritual growth", "Life Coaching": "Life coaching" },
};
/** Related categories for empty-state alternatives. */
export const RELATED: Record<Category, Category[]> = {
  Kambo: ["Spiritual Growth", "Breathwork"], Breathwork: ["Ice Bathing", "Meditation"], "Ice Bathing": ["Breathwork", "Sauna & Heat"], "Sound Healing": ["Meditation", "Spiritual Growth"],
  "Sauna & Heat": ["Ice Bathing", "BodyWork"], "Personal Coaching": ["Life Coaching", "Mindfulness"], Mindfulness: ["Meditation", "Yoga"], Meditation: ["Mindfulness", "Yoga"],
  Yoga: ["Meditation", "BodyWork"], BodyWork: ["Yoga", "Breathwork"], "Spiritual Growth": ["Meditation", "Sound Healing"], "Life Coaching": ["Personal Coaching", "Mindfulness"],
};
/** Category groups that count as the same intent (meditation ~ mindfulness, coaching ~ life coaching). */
export const CAT_EXPAND: Partial<Record<Category, Category[]>> = {
  Meditation: ["Meditation", "Mindfulness"], Mindfulness: ["Mindfulness", "Meditation"],
  "Personal Coaching": ["Personal Coaching", "Life Coaching"], "Life Coaching": ["Life Coaching", "Personal Coaching"],
};

export const COUNTRIES: Record<string, string[]> = {
  DE: ["deutschland", "germany", "allemagne", "duitsland", "alemania", "germania", "niemcy", "tyskland"],
  AT: ["osterreich", "oesterreich", "austria", "autriche", "oostenrijk", "rakousko"],
  CH: ["schweiz", "switzerland", "suisse", "svizzera", "zwitserland", "suiza", "swiss", "helvetia"],
  NL: ["niederlande", "netherlands", "holland", "nederland", "pays bas", "paises bajos", "olanda", "dutch"],
  FR: ["frankreich", "france", "frankrijk", "francia", "francja"],
  GB: ["uk", "united kingdom", "england", "grossbritannien", "great britain", "britain", "royaume uni", "engeland", "vereinigtes konigreich", "scotland", "schottland", "wales"],
  IE: ["irland", "ireland", "ierland", "irlande", "eire"],
  ES: ["spanien", "spain", "espana", "espagne", "spanje", "spagna"],
  PT: ["portugal", "portogallo"],
  IT: ["italien", "italy", "italia", "italie", "italie"],
  BE: ["belgien", "belgium", "belgique", "belgie", "belgio"],
  FI: ["finnland", "finland", "suomi", "finlande"],
  DK: ["danemark", "daenemark", "denmark", "danmark", "denemarken"],
  NO: ["norwegen", "norway", "norge", "noorwegen", "norvege"],
  SE: ["schweden", "sweden", "sverige", "zweden", "suede"],
  SK: ["slowakei", "slovakia", "slovensko"],
  GR: ["griechenland", "greece", "hellas", "griekenland", "grece"],
  PL: ["polen", "poland", "polska", "pologne"],
  SI: ["slowenien", "slovenia", "slovenija"],
  EE: ["estland", "estonia", "eesti"],
  LT: ["litauen", "lithuania", "lietuva"],
  RO: ["rumanien", "rumaenien", "romania", "roumanie"],
  LV: ["lettland", "latvia", "latvija"],
  CZ: ["tschechien", "czechia", "czech republic", "cesko", "tschechische republik"],
  HR: ["kroatien", "croatia", "hrvatska"],
  LU: ["luxemburg", "luxembourg"],
  CY: ["zypern", "cyprus", "chypre"],
  BG: ["bulgarien", "bulgaria"],
  HU: ["ungarn", "hungary", "magyarorszag", "hongrie"],
  MT: ["malta", "malte"],
  RS: ["serbien", "serbia", "srbija"],
  IS: ["island", "iceland", "islande"],
};
/** Region aliases -> [countryCode, GeoNames admin1 name]. */
export const REGIONS: Record<string, [string, string]> = {
  bayern: ["DE", "Bavaria"], bavaria: ["DE", "Bavaria"], "baden wurttemberg": ["DE", "Baden-Wurttemberg"], "baden wuerttemberg": ["DE", "Baden-Wurttemberg"], bw: ["DE", "Baden-Wurttemberg"],
  nrw: ["DE", "North Rhine-Westphalia"], "nordrhein westfalen": ["DE", "North Rhine-Westphalia"], hessen: ["DE", "Hesse"], niedersachsen: ["DE", "Lower Saxony"], sachsen: ["DE", "Saxony"],
  "sachsen anhalt": ["DE", "Saxony-Anhalt"], thuringen: ["DE", "Thuringia"], thueringen: ["DE", "Thuringia"], brandenburg: ["DE", "Brandenburg"], "schleswig holstein": ["DE", "Schleswig-Holstein"],
  "mecklenburg vorpommern": ["DE", "Mecklenburg-Vorpommern"], "rheinland pfalz": ["DE", "Rheinland-Pfalz"], saarland: ["DE", "Saarland"], ruhrgebiet: ["DE", "North Rhine-Westphalia"],
  tirol: ["AT", "Tyrol"], tyrol: ["AT", "Tyrol"], steiermark: ["AT", "Styria"], styria: ["AT", "Styria"], karnten: ["AT", "Carinthia"], kaernten: ["AT", "Carinthia"], vorarlberg: ["AT", "Vorarlberg"],
  oberosterreich: ["AT", "Upper Austria"], niederosterreich: ["AT", "Lower Austria"], oberoesterreich: ["AT", "Upper Austria"], niederoesterreich: ["AT", "Lower Austria"], burgenland: ["AT", "Burgenland"],
  tessin: ["CH", "Ticino"], ticino: ["CH", "Ticino"], wallis: ["CH", "Valais"], valais: ["CH", "Valais"], graubunden: ["CH", "Grisons"], graubuenden: ["CH", "Grisons"], waadt: ["CH", "Vaud"], vaud: ["CH", "Vaud"], aargau: ["CH", "Aargau"], thurgau: ["CH", "Thurgau"],
  toskana: ["IT", "Tuscany"], tuscany: ["IT", "Tuscany"], toscana: ["IT", "Tuscany"], sudtirol: ["IT", "Trentino-Alto Adige"], suedtirol: ["IT", "Trentino-Alto Adige"], sizilien: ["IT", "Sicily"], sicily: ["IT", "Sicily"], sardinien: ["IT", "Sardinia"], sardinia: ["IT", "Sardinia"], lombardei: ["IT", "Lombardy"], lombardy: ["IT", "Lombardy"],
  andalusien: ["ES", "Andalusia"], andalusia: ["ES", "Andalusia"], mallorca: ["ES", "Balearic Islands"], ibiza: ["ES", "Balearic Islands"], balearen: ["ES", "Balearic Islands"], katalonien: ["ES", "Catalonia"], catalonia: ["ES", "Catalonia"], kanaren: ["ES", "Canary Islands"], "canary islands": ["ES", "Canary Islands"], teneriffa: ["ES", "Canary Islands"], tenerife: ["ES", "Canary Islands"],
  provence: ["FR", "Provence-Alpes-Côte d'Azur"], "cote d azur": ["FR", "Provence-Alpes-Côte d'Azur"], bretagne: ["FR", "Brittany"], brittany: ["FR", "Brittany"], normandie: ["FR", "Normandy"], normandy: ["FR", "Normandy"], elsass: ["FR", "Grand Est"], alsace: ["FR", "Grand Est"], korsika: ["FR", "Corsica"], corsica: ["FR", "Corsica"],
  algarve: ["PT", "Faro"], schottland: ["GB", "Scotland"], scotland: ["GB", "Scotland"], wales: ["GB", "Wales"], flandern: ["BE", "Flanders"], flanders: ["BE", "Flanders"], wallonie: ["BE", "Wallonia"],
  "noord holland": ["NL", "North Holland"], "zuid holland": ["NL", "South Holland"], "noord brabant": ["NL", "North Brabant"], gelderland: ["NL", "Gelderland"], friesland: ["NL", "Friesland"], kreta: ["GR", "Crete"], crete: ["GR", "Crete"],
};

/** Words never treated as places or keywords. */
export const STOP = new Set(("ich du er sie wir ihr suche suchen such finde finden find search looking look for want need brauche mochte moechte will wurde gerne bitte please help hilfe hilft " +
  "in im am an auf um bei nahe near nearby around close to the a an and or und oder mit with ohne without fur fuer for von vom zu zum zur der die das den dem des ein eine einen einem einer " +
  "mein meine my me mir mich is ist sind are was wie what where wo wann when gibt es there some any etwas something gut good beste best top empfehlung recommend recommendation tipps " +
  "heute today morgen tomorrow tonight abend abends evening nacht night woche week weekend wochenende diese dieser dieses this next nachste naechste kommende kommenden coming " +
  "angebot angebote offer offers anbieter provider kurs kurse course courses class classes session sessions termin termine event events workshop workshops " +
  "euro eur chf gbp unter bis max maximal under below cheap gunstig guenstig kostenlos free gratis preis price " +
  "le la les des du de et pour avec en het een van voor met op el los las para con y il di per e " +
  "gegen against bei aus kann konnen koennen nicht not no kein keine keinen nur only auch also sehr very viel mehr more noch schon jetzt now hier here dort there " +
  "hilft hilfe helps help was what wer who wie how warum why welche welcher which gibt give geben habe haben have has bin bist sein be am is war " +
  "ganz alle all neue new alt old klein small gross big lang long kurz short schon nice schoen schon toll great " +
  "anfanger anfaenger beginner beginners principiantes debutant debutants fortgeschrittene advanced " +
  "mann frau men people leute paar couple gruppe group einzel private privat personal " +
  "je tu il nous vous ils est sont avoir faire ik jij wij zijn hebben yo tu es son tengo hay io sono ho c e " +
  "near me around here").split(/\s+/));
