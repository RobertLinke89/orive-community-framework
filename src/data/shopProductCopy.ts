import type { ShopifyProduct } from "@/lib/shopify";
import { shopCategoryOf } from "@/lib/shopDisplay";

type LangText = { de: string; en: string };

export type ShopProductStory = {
  about: LangText;
  make: LangText;
  use: LangText;
};

function t(de: string, en: string): LangText {
  return { de: de.replace(/\s+/g, " ").trim(), en: en.replace(/\s+/g, " ").trim() };
}

const COPY: Record<string, ShopProductStory> = {
  "premium-yoga-mat": {
    about: t(
      "Die Premium Cork Yoga Mat ist eine Alltagsmatte für stehende, sitzende und liegende Asanas. Die Lauffläche ist Kork, der Unterbau Naturkautschuk. Das Format 183 × 66 cm bei 5 mm Stärke gibt genug Fläche für die meisten Körpergrößen, ohne die Matte unnötig schwer zu machen. Kork bleibt bei leichtem Schweiß griffig und braucht kein extra Spray.",
      "The Premium Cork Yoga Mat is a daily mat for standing, seated and supine asana. The top is cork over a natural-rubber base. At 183 × 66 cm and 5 mm it covers most body sizes without extra bulk. Cork stays grippy with light sweat, so you do not need a spray."
    ),
    make: t(
      "Kork kommt von der Rinde der Korkeiche; die Bäume bleiben stehen, die Rinde wächst nach. Die Schicht wird auf Naturkautschuk gelegt, der aus Latex vulkanisiert wird. So entsteht eine geschlossene Platte, die sich rollt, aber nicht wellt. Die Kanten sind geschnitten, nicht umsäumt. Es gibt keine extra Beschichtung und keinen aufgedruckten Griff.",
      "Cork is harvested from cork-oak bark; the trees stay standing and the bark grows back. That layer is bonded to natural rubber vulcanized from latex. The result is a closed sheet that rolls without warping. Edges are cut, not bound. There is no extra coating and no printed grip pattern."
    ),
    use: t(
      "Rolle die Matte flach aus und tritt barfuß auf. Für stehende Haltungen reicht die Korkfläche; bei sehr schwitziger Praxis ein Handtuch obenauf. Nach der Stunde feucht abwischen, offen trocknen, danach rollen. Kein Waschmaschine, keine direkte Sonne über Stunden. Für Restauration oder Yin die gleiche Matte; bei Bedarf ein Bolster oder eine Decke dazu.",
      "Unroll it flat and practice barefoot. The cork face is enough for standing work; add a towel on top if you sweat heavily. Wipe after class, dry open, then roll. No washing machine, no hours in direct sun. Use the same mat for restorative or Yin work; add a bolster or blanket if you need lift."
    ),
  },
  "yoga-block-set": {
    about: t(
      "Das Set enthält zwei Bambusblöcke für Ausrichtung und Hebel. Bambus ist hart genug, um das Gewicht der Hände oder der Hüfte zu tragen, ohne nachzugeben. Die Kanten sind gerundet, damit sie in der Hand und unter dem Sitzbein nicht schneiden. Die Blöcke ersetzen weder Gurt noch Matte; sie verkürzen den Weg zum Boden.",
      "The set is two bamboo blocks for alignment and leverage. Bamboo is hard enough to take the load of hands or hips without collapsing. Edges are rounded so they do not cut the hand or sitting bone. The blocks do not replace a strap or a mat; they shorten the path to the floor."
    ),
    make: t(
      "Die Blöcke kommen aus nachhaltig geerntetem Bambus, der zu Leimholz geschichtet und dann auf Blockmaß gesägt wird. Die Flächen sind geschliffen, die Kanten gebrochen. Es gibt keine Schaumstoffseele und keine Kunststoffkante. Jeder Block ist massiv, deshalb schwerer als Schaum, aber formstabil.",
      "The blocks are cut from layered, sustainably harvested bamboo glued into lumber, then sawn to block size. Faces are sanded and edges eased. There is no foam core and no plastic rim. Each block is solid, so heavier than foam, and it keeps its shape."
    ),
    use: t(
      "Unter die Hände in stehenden Vorwärtsbeugen, unter das Becken in sitzenden Haltungen, unter den Kopf in liegenden Varianten. Höhe wählen: hochkant, flach oder auf der Seite. Beide Blöcke gleichzeitig für Schulterstand-Vorbereitung oder Hüftöffnung. Nach dem Gebrauch trocken abwischen; nicht dauerhaft feucht lagern.",
      "Under the hands in standing folds, under the pelvis in seated work, under the head when lying down. Choose height: on end, flat, or on the side. Use both blocks together for shoulder-stand prep or hip opening. Wipe dry after use; do not store them wet."
    ),
  },
  "yoga-strap-organic": {
    about: t(
      "Der Gurt ist 250 cm lang, aus GOTS-zertifizierter Bio-Baumwolle, mit D-Ring-Schnalle. Er verlängert die Arme, wenn die Hände die Füße oder einander nicht erreichen. Das Gewebe ist handgewebt und hält die Schnalle, ohne zu rutschen, sobald sie zugezogen ist.",
      "The strap is 250 cm of GOTS-certified organic cotton with a D-ring buckle. It lengthens the arms when the hands cannot reach the feet or each other. The weave is hand-woven and holds the buckle once it is drawn tight."
    ),
    make: t(
      "Die Baumwolle kommt aus kontrolliert biologischem Anbau und ist nach GOTS zertifiziert. Sie wird zu einem Gurtband gewebt, die Enden werden eingefasst, die Metall-D-Ringe werden eingenäht. Kein Elasthan, keine Beschichtung. Die Länge 250 cm reicht für die meisten Körper und für Bindungen um Oberschenkel oder Brustkorb.",
      "The cotton is from certified organic farming and carries a GOTS mark. It is woven into webbing, the ends are bound, and the metal D-rings are stitched in. No elastane, no coating. At 250 cm it covers most bodies and wraps around thighs or the ribcage."
    ),
    use: t(
      "Schlaufe um den Fuß in sitzenden Vorwärtsbeugen, um die Oberschenkel in Hüftöffnern, hinter dem Rücken für Schulterarbeit. Die Schnalle festziehen, dann die Haltung halten. Nicht als Hebegurt für Geräte oder als Kletterband nutzen. Handwäsche oder Schonwaschgang, flach trocknen.",
      "Loop it around the foot in seated folds, around the thighs in hip openers, behind the back for shoulder work. Tighten the buckle, then hold the pose. Do not use it as a lifting sling or climbing tape. Hand wash or a gentle cycle, dry flat."
    ),
  },
  "meditation-cushion-zafu": {
    about: t(
      "Der Zafu ist ein rundes Sitzkissen mit Buchweizenschalen und abnehmbarem Bio-Baumwollbezug. Die Höhe von 15 cm hebt das Becken, damit die Knie tiefer als die Hüfte liegen können. Buchweizen passt sich an und bleibt danach formbar, anders als Schaum, der nachgibt und bleibt.",
      "The zafu is a round cushion filled with buckwheat hulls and a removable organic-cotton cover. At 15 cm it lifts the pelvis so the knees can sit below the hips. Buckwheat settles and stays adjustable, unlike foam that compresses and stays flat."
    ),
    make: t(
      "Der Kern ist lose Buchweizenschale in einem Innenkissen. Darüber sitzt der Bio-Baumwollbezug mit Reißverschluss. Die runde Form ist die klassische Zafu-Silhouette, nicht ein eckiges Studio-Kissen. Es gibt keine versteckten Schaumkerne. Nach Jahren kann man Schalen nachfüllen, wenn der Sitz sinkt.",
      "The core is loose buckwheat hull in an inner sack. Over that sits the organic-cotton cover with a zip. The round shape is the classic zafu, not a square studio cushion. There is no hidden foam core. After years you can top up the hulls if the seat drops."
    ),
    use: t(
      "Auf eine Matte oder ein Zabuton stellen, darauf im Schneidersitz, Burmese oder Seiza mit dem Kissen zwischen den Waden. Becken nach vorn kippen, Knie auf dem Boden oder auf Stützen. Den Bezug abziehen und waschen; den Füllkern nur lüften, nicht waschen. Für lange Sitze ein Zabuton darunter gegen taube Füße.",
      "Set it on a mat or zabuton. Sit cross-legged, Burmese, or seiza with the cushion between the calves. Tilt the pelvis forward; rest the knees on the floor or on supports. Wash the cover only; air the fill, do not wash it. For long sits, put a zabuton underneath to spare the feet."
    ),
  },
  "yoga-bolster-round": {
    about: t(
      "Der runde Bolster ist 65 × 25 cm, fest genug für Yin und Restauration, nachgiebig genug, um die Lenden nicht zu sperren. Der Bezug ist Bio-Baumwolle, die Füllung recycelte Faser. Er trägt Brustkorb, Becken oder Oberschenkel, je nach Haltung.",
      "The round bolster is 65 × 25 cm: firm enough for Yin and restoration, soft enough not to lock the lumbar. The cover is organic cotton, the fill recycled fibre. It can hold the ribcage, pelvis or thighs, depending on the pose."
    ),
    make: t(
      "Ein Innenkern aus recycelter Faser wird in Form gestopft und mit einem Baumwollbezug geschlossen. Die runde Rolle ist durchgehend gefüllt, nicht in Kammern. Der Bezug sitzt straff, damit die Rolle nicht auswalzt. Es gibt keinen Kunststoffkern.",
      "An inner core of recycled fibre is packed to shape and closed in a cotton cover. The round roll is filled through, not in chambers. The cover sits tight so the roll does not pancake. There is no plastic core."
    ),
    use: t(
      "Längs unter die Wirbelsäule für Herzöffner, quer unter die Knie in Savasana, unter das Becken in liegenden Hüftöffnern. In Yin die Haltung Minuten halten; den Bolster nicht als Sprungbrett oder Gewicht benutzen. Bezug abziehen, wenn vorgesehen, sonst Bezug abwischen und lüften.",
      "Lengthwise under the spine for heart openers, across the knees in savasana, under the pelvis in supine hip work. In Yin, hold for minutes. Do not use the bolster as a step or a weight. Remove the cover if it is made to come off; otherwise wipe and air it."
    ),
  },
  "breathwork-journal": {
    about: t(
      "Das Journal gibt 90 Tage Vorlagen für Atemprotokolle, kurze Reflexion und Techniknotizen. Es ist zum Beschreiben, nicht zum Ersetzen einer Anleitung. Der Einband liegt flach, damit du mit einer Hand schreiben kannst, während die andere den Timer hält.",
      "The journal gives 90 days of breath-tracking templates, short reflection and technique notes. It is for writing, not a substitute for instruction. The binding lies flat so you can write with one hand while the other holds a timer."
    ),
    make: t(
      "Innenteil und Umschlag sind für den täglichen Gebrauch gebunden, Lay-flat, damit die Mitte nicht zuhält. Die Seiten sind liniert bzw. mit Feldern für Dauer, Verhältnis und Befinden. Es ist ein gedrucktes Heft, kein App-Zugang und kein Download-Code.",
      "The block and cover are bound for daily use, lay-flat so the gutter does not fight you. Pages are lined or boxed for duration, ratio and how you felt. It is a printed notebook, not an app login or a download code."
    ),
    use: t(
      "Vor der Sitzung Datum und Protokoll notieren, danach Dauer, Verhältnis und eine Zeile zum Verlauf. 90 Tage hintereinander oder mit Pausen, wie die Praxis liegt. Zusammen mit Timer, Karten oder Trainer nutzen. Nicht wasserdicht; nicht ins Eisbad mitnehmen.",
      "Note the date and protocol before the sit, then duration, ratio and one line on how it went. Ninety days in a row or with gaps, as the practice allows. Use it with a timer, cards or a trainer. It is not waterproof; do not take it into the ice."
    ),
  },
  "nose-breathing-tape": {
    about: t(
      "Die Packung enthält 90 mundgerechte Streifen mit hypoallergenem, BPA-freiem Kleber. Sie sollen den Mund im Schlaf geschlossen halten, damit die Nase führt. Das ist ein Hilfsmittel, kein Therapiegerät und kein Ersatz für Abklärung bei Schnarchen oder Atemnot.",
      "The pack holds 90 mouth strips with hypoallergenic, BPA-free adhesive. They are meant to keep the mouth closed in sleep so the nose leads. This is an aid, not a treatment device and not a substitute for checking snoring or breath trouble."
    ),
    make: t(
      "Die Streifen sind medizinisch taugliches Vlies mit hautnahem Kleber, BPA-frei. Jeder Streifen ist einzeln zum Abziehen. Es gibt kein Wirkstoffdepot und kein Menthol. Die Menge 90 reicht für etwa drei Monate bei nächtlichem Gebrauch.",
      "The strips are medical-grade fleece with a skin adhesive, BPA-free. Each strip peels off on its own. There is no drug reservoir and no menthol. Ninety pieces cover about three months of nightly use."
    ),
    use: t(
      "Trockene, saubere Lippen, Streifen mittig über den geschlossenen Mund, nicht über die Nase. Nur bei freier Nasenatmung. Bei Erkältung, verstopfter Nase oder Unsicherheit weglassen. Morgens abziehen, Haut bei Bedarf entfetten. Nicht für Kinder ohne klare Indikation und Anleitung.",
      "Dry, clean lips; place the strip across the closed mouth, not over the nose. Only when nasal breathing is free. Skip it with a cold, a blocked nose or if you are unsure. Peel it off in the morning; degrease the skin if needed. Not for children without a clear reason and instruction."
    ),
  },
  "pranayama-timer": {
    about: t(
      "Der Timer ist ein hölzernes Intervallgerät mit leisem Schlag. Er zählt nicht Kalorien und speichert keine Daten. Er gibt Abschnitte für Box Breathing, kohärentes Atmen oder angeleitete Runden, ohne Bildschirmlicht.",
      "The timer is a wooden interval piece with a soft chime. It does not count calories and stores no data. It marks segments for box breathing, coherent breathing or guided rounds, without screen light."
    ),
    make: t(
      "Gehäuse aus Holz, Mechanik oder Elektronik für Intervalle, Schlagwerk für den Ton. Die Form ist schlicht, damit er auf dem Kissen oder dem Tisch liegt, ohne zu rollen. Kein App-Zwang. Batterie oder Aufzug je nach geliefertem Modell; die Angabe steht am Gerät.",
      "A wood case, interval mechanics or electronics, and a striker for the tone. The shape is plain so it sits on a cushion or table without rolling. No app required. Battery or wind-up depends on the unit you receive; that is marked on the device."
    ),
    use: t(
      "Intervall wählen, Timer starten, auf das Kissen setzen. Bei Box gleich lange Vierer, bei kohärent etwa fünf bis sechs Atemzüge pro Minute. Den Schlag als Wechsel nutzen, nicht als Hetze. Nach Gebrauch ausschalten. Nicht ins Wasser, nicht ins Eis.",
      "Set the interval, start it, place it on the cushion. For box work, even fours; for coherent breathing, about five to six breaths a minute. Use the chime as a change cue, not a rush. Switch it off after. Keep it out of water and ice."
    ),
  },
  "portable-ice-bath": {
    about: t(
      "Die tragbare Wanne ist eine faltbare Kältewanne für zu Hause. Dreilagige Isolierung hält das Wasser länger kalt. Sie ist für Körper bis etwa 190 cm gedacht. Sie ersetzt kein festes Becken und keine medizinische Kältekammer.",
      "The portable tub is a foldable home cold plunge. Triple-layer insulation keeps the water cold longer. It is sized for bodies up to about 190 cm. It does not replace a fixed tank or a medical cold chamber."
    ),
    make: t(
      "Außenhaut, Isolierschicht und Innenfolie sind zu einer stehenden Wanne verklebt oder verschweißt. Zusammengelegt liegt sie flach. Es gibt keine eingebaute Kühlmaschine in diesem Modell; die Kälte kommt von Wasser, Eis oder Vorkühlung. Ablauf und Aufbau folgen der beiliegenden Anleitung.",
      "Outer skin, insulation and inner liner are bonded or welded into a standing tub. Folded, it lies flat. This model has no built-in chiller; cold comes from water, ice or pre-cooling. Drain and setup follow the included instructions."
    ),
    use: t(
      "Auf ebenem, tragfähigem Untergrund aufbauen, mit kaltem Wasser und bei Bedarf Eis füllen, Temperatur messen. Kurz einsteigen, atmen, wieder raus, danach warm anziehen. Dauer selbst wählen und steigern. Nicht allein, wenn du unsicher bist; nicht bei bekannten Kreislaufproblemen ohne Rücksprache. Nach Gebrauch leeren, trocknen, lagern.",
      "Set it on level, load-bearing ground, fill with cold water and ice if needed, and measure the temperature. Step in briefly, breathe, step out, then dress warm. Choose and build duration yourself. Do not go in alone if you are unsure; do not use it with known circulation issues without advice. Empty, dry and store after use."
    ),
  },
  "cold-plunge-thermometer": {
    about: t(
      "Das Digitalthermometer liest die Wassertemperatur der Wanne. Das Display ist groß und hinterleuchtet, das Gehäuse wasserdicht für den Einsatz am Beckenrand. Es steuert die Wanne nicht; es zeigt nur die Zahl.",
      "The digital thermometer reads the tub water. The display is large and backlit; the housing is waterproof for the pool edge. It does not control the tub; it only shows the number."
    ),
    make: t(
      "Fühler, Elektronik und abgedichtetes Gehäuse. Die Anzeige ist für nasse Hände lesbar. Stromquelle ist in der Regel eine Knopfbatterie; Wechsel nach Anleitung. Kein Funkzwang, keine App.",
      "Probe, electronics and a sealed case. The display is readable with wet hands. Power is usually a button cell; change it as marked. No radio link, no app."
    ),
    use: t(
      "Fühler ins Wasser, nicht nur an die Luft über der Wanne. Warten, bis der Wert steht, dann einsteigen. Vor und nach dem Eis neu messen, wenn du nachfüllst. Nicht als Fieberthermometer, nicht in kochendes Wasser.",
      "Put the probe in the water, not just in the air above the tub. Wait for a steady reading, then get in. Measure again if you add ice. Not a clinical thermometer, not for boiling water."
    ),
  },
  "recovery-robe": {
    about: t(
      "Der Recovery-Mantel ist ein kapuzenloser oder kapuzenhaltiger Mikrofaser-Mantel zum Abtrocknen nach der Kälte. Er saugt Wasser schnell, hat tiefe Taschen und ist als One-Size geschnitten. Er wärmt durch Trockenheit, nicht durch Heizung.",
      "The recovery robe is a microfibre wrap for drying after cold. It takes water quickly, has deep pockets and is cut as one size. It warms by drying you, not by heating."
    ),
    make: t(
      "Mikrofasergewebe, geschnitten als Mantel mit Kapuze und Taschen. Keine Daunen, keine Stromschleifen. Die Faser ist auf Saugfähigkeit und schnelles Trocknen ausgelegt, nicht auf Straßenmode.",
      "Microfibre cloth, cut as a robe with a hood and pockets. No down, no heating wires. The fibre is cut for soak-up and fast drying, not for street wear."
    ),
    use: t(
      "Direkt nach dem Aussteigen anziehen, nicht erst im Wind stehen. Kapuze auf, Taschen für Hände. Danach aufhängen oder schonend waschen. Nicht als Ersatz für einen Neoprenanzug im Wasser tragen.",
      "Put it on as you step out, do not stand in the wind first. Hood up, hands in the pockets. Then hang it or wash it on a gentle cycle. Do not wear it in the water as a substitute for a wetsuit."
    ),
  },
  "crystal-singing-bowl": {
    about: t(
      "Die mattierte Quarzschale ist auf C gestimmt, 25 cm, mit gepolstertem Schlägel und O-Ring. Der Ton ist der Grundton C, oft als tiefer, haltender Klang genutzt. 432 Hz ist die angegebene Stimmung dieser Schale. Sie ist ein Instrument, kein Diagnosegerät.",
      "The frosted quartz bowl is tuned to C, 25 cm, with a padded mallet and O-ring. The pitch is C, used as a low, holding tone. 432 Hz is the stated tuning of this bowl. It is an instrument, not a diagnostic tool."
    ),
    make: t(
      "Quarzsand wird zu einer Schale gesintert oder geformt und auf Tonhöhe gebracht. Die Oberfläche ist mattiert, nicht klar. Beiliegend ein weicher Schlägel und ein Gummirring, damit die Schale nicht auf hartem Boden steht. Kein Metalllegierungsrand.",
      "Quartz sand is sintered or formed into a bowl and brought to pitch. The face is frosted, not clear. A soft mallet and a rubber ring come with it so the bowl does not sit on a hard floor. There is no metal alloy rim."
    ),
    use: t(
      "Schale auf den O-Ring, Raum ohne Zug. Anstreichen oder anschlagen, Ton ausklingen lassen. Abstand zu Ohren und Glas. Nicht fallen lassen; Quarz splittert. Nach Gebrauch abstauben, trocken lagern.",
      "Set the bowl on the O-ring in a still room. Circle or strike it, let the tone decay. Keep distance from ears and glass. Do not drop it; quartz chips. Dust it off and store it dry."
    ),
  },
  "tibetan-singing-bowl": {
    about: t(
      "Die handgehämmerte Schale aus Nepal ist eine Sieben-Metall-Legierung, 15 cm Durchmesser, mit Kissen und Schlägel. Der Klang trägt Obertöne, kein einzelner Sinuston. Sie ist zum Anschlagen und Anreiben gedacht.",
      "The hand-hammered bowl from Nepal is a seven-metal alloy, 15 cm across, with a cushion and striker. The sound carries overtones, not a single sine. It is meant to be struck and circled."
    ),
    make: t(
      "In Nepal wird die Legierung gegossen oder geschmiedet und per Hand in Form gehämmert. Jede Schale weicht leicht in Wandstärke und Ton ab. Kissen und Schlägel liegen bei. Es gibt keine Elektronik und keine festgelegte Frequenzangabe wie bei Quarz.",
      "In Nepal the alloy is cast or forged and hammered to shape by hand. Wall thickness and pitch vary slightly from bowl to bowl. Cushion and striker are included. There is no electronics and no printed frequency like a quartz bowl."
    ),
    use: t(
      "Auf das Kissen, mit dem Schlägel anschlagen oder den Rand reiben, bis der Ton steht. Für den eigenen Sitz oder für eine Gruppe im Raum. Nicht als Kochschale, nicht spülmaschinenfest. Trocken abwischen.",
      "Set it on the cushion, strike it or rub the rim until the tone holds. For your own sit or for a room. Not a cooking bowl, not dishwasher-safe. Wipe it dry."
    ),
  },
  "tuning-fork-set": {
    about: t(
      "Fünf Gabeln aus medizinischem Aluminium: 128, 256, 512, 4096 Hz und eine gewichtete Otto-Gabel. Samtbeutel liegt bei. Die Gabeln sind Stimm- und Körperwerkzeuge, keine Messgeräte für Diagnosen.",
      "Five medical-grade aluminium forks: 128, 256, 512, 4096 Hz and a weighted Otto fork. A velvet pouch is included. The forks are tuning and body tools, not diagnostic meters."
    ),
    make: t(
      "Aluminium wird auf Länge und Masse gebracht, damit die Zinken die genannte Frequenz halten. Die Otto-Gabel trägt Gewichte an den Enden. Griffe sind glatt. Der Beutel schützt die Zinken gegeneinander.",
      "Aluminium is cut and massed so the tines hold the stated frequency. The Otto fork has weights at the ends. Handles are smooth. The pouch keeps the tines from knocking each other."
    ),
    use: t(
      "Anschlagen an einem Aktivator oder der eigenen Handfläche, dann in der Nähe des Körpers oder auf gesetzten Punkten halten, wie du es gelernt hast. Nicht auf Knochen hämmern, nicht ins Ohr stecken. Nach Gebrauch in den Beutel. Keine Desinfektion in der Spülmaschine.",
      "Strike on an activator or your palm, then hold near the body or on points you have been taught. Do not hammer bone, do not put a fork in the ear. Back in the pouch after. Do not run them through a dishwasher."
    ),
  },
  "mala-beads-108": {
    about: t(
      "Die Mala hat 108 Sandelholzperlen, handgeknotet, mit Tigerauge als Guru-Perle. Das Holz trägt den eigenen Geruch. Sie ist ein Zählband für Japa oder stille Runden, kein Schmuckstück mit Wirkstoff.",
      "The mala is 108 sandalwood beads, hand-knotted, with a tiger-eye guru bead. The wood carries its own scent. It is a counting cord for japa or silent rounds, not a charm with a drug in it."
    ),
    make: t(
      "Indisches Sandelholz wird zu Perlen gedreht, mit Knoten dazwischen aufgefädelt, die Guru-Perle schließt. Handknoten halten den Abstand, wenn eine Perle bricht. Kein Kunststoffkern in den Holzperlen.",
      "Indian sandalwood is turned into beads, strung with knots between them, and closed with the guru bead. Hand knots keep the spacing if one bead fails. The wood beads have no plastic core."
    ),
    use: t(
      "In der Hand, Perle für Perle, Mantra oder Atemzug pro Perle, Guru-Perle nicht überschreiten oder dort wenden. Trocken halten, nicht im Wasser tragen. Bei Geruchsverlust reicht der Zählgebrauch weiter.",
      "In the hand, bead by bead, one mantra or breath per bead; do not cross the guru bead, or turn there. Keep it dry; do not wear it in water. If the scent fades, it still counts."
    ),
  },
  "meditation-eye-pillow": {
    about: t(
      "Das Augenkissen ist Seide, gefüllt mit Bio-Leinsamen und französischem Lavendel. Das Gewicht liegt leicht auf den Lidern in Savasana oder im Sitzen. Es ist ein Kissen, kein Schlafmittel.",
      "The eye pillow is silk, filled with organic flaxseed and French lavender. The weight sits lightly on the lids in savasana or in a sit. It is a pillow, not a sleeping drug."
    ),
    make: t(
      "Ein Seidenbezug wird mit Leinsamen und Lavendelblüten gefüllt und zugenäht oder mit Innenkissen versehen. Die Menge ist so bemessen, dass das Kissen die Augen bedeckt, ohne den Nacken zu ziehen. Kein Kühlakku im Inneren.",
      "A silk cover is filled with flaxseed and lavender blossom and sewn or given an inner sack. The fill is enough to cover the eyes without pulling the neck. There is no ice pack inside."
    ),
    use: t(
      "Auf die geschlossenen Augen in Savasana oder im Liegen. Nicht auf offene Augen. Bei Lavendelunverträglichkeit weglassen. Lüften, nicht waschen, wenn der Kern fest eingenäht ist; Bezug nur waschen, wenn er abnehmbar ist.",
      "Over closed eyes in savasana or lying down. Not on open eyes. Skip it if lavender bothers you. Air it; do not wash a sewn-in core. Wash the cover only if it comes off."
    ),
  },
  "incense-set-palo-santo": {
    about: t(
      "Das Set enthält sechs Palo-Santo-Stäbe, ein Bündel weißer Salbei und eine keramische Schale. Das Holz und das Kraut sind als Räucherware gedacht, nicht als Lebensmittel. Die Herkunft ist als ethisch bezogen angegeben.",
      "The set is six palo santo sticks, a white-sage bundle and a ceramic dish. The wood and herb are for smoke, not food. The sourcing is stated as ethical."
    ),
    make: t(
      "Palo Santo als geschnittene Stäbe, Salbei als gebundenes Bündel, Schale aus Keramik zum Auffangen von Asche. Kein eingearbeitetes ätherisches Öl im Holz über das natürliche Harz hinaus. Die Stückzahl ist fest: sechs Stäbe, ein Bündel.",
      "Palo santo as cut sticks, sage as a bound bundle, a ceramic dish for ash. No extra essential oil in the wood beyond the natural resin. The count is fixed: six sticks, one bundle."
    ),
    use: t(
      "In der Schale anzünden, kurz brennen lassen, Flamme löschen, Rauch nutzen, Rest in der Schale ausglimmen. Fenster offen, Rauchmelder beachten, nie unbeaufsichtigt. Nicht in die Augen blasen, nicht einnehmen.",
      "Light it in the dish, let it flame briefly, blow out, use the smoke, let the rest die in the dish. Window open, mind the smoke alarm, never leave it. Do not blow it at eyes, do not eat it."
    ),
  },
  "singing-bowl-mini-travel": {
    about: t(
      "Die Reiseschale ist 8 cm Messing mit filzumwickeltem Schlägel. Sie passt in die Tasche und gibt einen kürzeren, helleren Ton als Atelier-Schalen. Zum Ankommen unterwegs, nicht als Lautsprecher.",
      "The travel bowl is 8 cm brass with a felt-wrapped striker. It fits a pocket and speaks shorter and brighter than a studio bowl. For arriving on the road, not as a speaker."
    ),
    make: t(
      "Messing wird zu einer kleinen Schale gezogen oder gegossen, der Schlägel mit Filz umwickelt. 8 cm ist die Außenweite. Kein Kissen im Mini-Set nötig, ein Tuch reicht als Unterlage.",
      "Brass is drawn or cast into a small bowl; the striker is wrapped in felt. 8 cm is the outside width. No cushion is required in the mini set; a cloth is enough as a pad."
    ),
    use: t(
      "Auf ein Tuch, anschlagen oder reiben, Ton ausklingen lassen. Im Zug oder Hotel leiser anschlagen. Trocken halten, nicht in die Kulturbeutel-Nässe legen.",
      "On a cloth, strike or circle, let the tone go. In a train or hotel, strike more softly. Keep it dry; do not leave it in a wet wash bag."
    ),
  },
  "foam-roller-textured": {
    about: t(
      "Die Rolle ist 45 cm EVA-Schaum mit mehreren Oberflächenzonen für myofasziale Arbeit. Hart genug für Oberschenkel und Rücken, nicht so weich wie eine Gymnastikrolle. Sie ersetzt keine Behandlung.",
      "The roller is 45 cm EVA foam with several surface zones for myofascial work. Firm enough for thighs and back, not as soft as a gym roll. It does not replace treatment."
    ),
    make: t(
      "EVA wird zu einem Zylinder geschäumt und mit Profil versehen. Der Kern ist durchgehend Schaum, kein Holz. 45 cm Länge deckt Rückenbreite in Rückenlage ab, ohne überlang zu sein.",
      "EVA is foamed into a cylinder and given a profile. The core is foam through, not wood. At 45 cm it covers the back in supine work without being oversized."
    ),
    use: t(
      "Körpergewicht auf die Rolle, langsam über den Muskel, nicht über die Wirbelsäule pressen. Kurz halten, weiterrollen. Nach dem Training oder an Ruhetagen. Bei akutem Schmerz stoppen. Feucht abwischen.",
      "Put body weight on the roller, move slowly over the muscle, do not jam the spine. Pause, then roll on. After training or on rest days. Stop if pain is sharp. Wipe it damp."
    ),
  },
  "massage-ball-set": {
    about: t(
      "Drei Bälle in weich, mittel und fest, im Format eines Lacrosse-Balls, für Triggerpunkte an Gesäß, Schulter und Fuß. Drei Härten, damit du nicht mit dem härtesten Stück anfängst.",
      "Three balls in soft, medium and firm, lacrosse-sized, for trigger points in glutes, shoulder and foot. Three densities so you do not start with the hardest piece."
    ),
    make: t(
      "Gummi- oder Elastomerbälle in drei Shore-Härten, gleiche Größe. Keine Vibration, keine Elektronik. Die Oberfläche ist griffig, nicht beflockt.",
      "Rubber or elastomer balls in three Shore hardnesses, same size. No vibration, no electronics. The face is grippy, not flocked."
    ),
    use: t(
      "Ball unter den Muskel, Körpergewicht dosieren, 20–40 Sekunden halten oder klein kreisen. Am Fuß im Stehen, an der Schulter an der Wand. Weichen Ball zuerst. Nicht auf verletzte Gelenke legen.",
      "Ball under the muscle, dose your weight, hold 20–40 seconds or make small circles. On the foot while standing, on the shoulder at a wall. Soft ball first. Do not park it on an injured joint."
    ),
  },
  "acupressure-mat": {
    about: t(
      "Matte und Kissen mit über 10.000 Kunststoffspitzen auf Leinen, Füllung Kokosfaser. Der Reiz ist Druck, kein Strom. Zum Liegen auf dem Rücken oder unter den Nacken, nicht zum Schlafen die ganze Nacht, wenn die Haut es nicht kennt.",
      "Mat and pillow with more than 10,000 plastic points on linen, coconut-fibre fill. The stimulus is pressure, not current. For lying on the back or under the neck, not for a full first night if the skin is new to it."
    ),
    make: t(
      "Ein Leinenbezug nimmt die Spitzen auf, darunter Kokosfaser. Das Kissen ist gleich aufgebaut, kleiner. Die Spitzen sind fest im Tuch, nicht magnetisch. Abnehmbarer Bezug, soweit der Reißverschluss das hergibt.",
      "A linen cover holds the points, coconut fibre underneath. The pillow is the same build, smaller. The points are fixed in the cloth, not magnetic. Removable cover where the zip allows."
    ),
    use: t(
      "Auf den Boden, Rücken auf die Spitzen, Kissen unter den Nacken oder die Knie. Mit Kleidung beginnen, Zeit kurz halten, dann steigern. Bei Hautreizung aufhören. Bezug waschen, Spitzen nicht knicken.",
      "On the floor, back on the points, pillow under the neck or knees. Start in clothes, keep time short, then build. Stop if the skin reacts. Wash the cover; do not fold the points hard."
    ),
  },
  "gua-sha-rose-quartz": {
    about: t(
      "Das Gua-Sha-Stück ist handgeschnittener Rosenquarz aus Brasilien für das Gesicht. Die Kanten sind glatt für streichende Bewegungen über Haut und oberflächliche Faszie. Es kühlt nicht von selbst; du kannst es kurz kalt legen.",
      "The gua sha is hand-carved Brazilian rose quartz for the face. Edges are smooth for strokes over skin and superficial fascia. It does not cool on its own; you can chill it briefly."
    ),
    make: t(
      "Rosenquarz wird gesägt, geschliffen und poliert. Jedes Stück zeigt die Maserung des Steins. Keine Elektronik, keine Beschichtung. Die Form folgt den üblichen Gesichtskurven, nicht einem medizinischen Instrumentensatz.",
      "Rose quartz is sawn, ground and polished. Each piece shows the stone’s grain. No electronics, no coating. The shape follows common facial curves, not a clinical instrument set."
    ),
    use: t(
      "Gesicht gereinigt, Öl oder Creme, Stein flach führen, vom Zentrum nach außen, leicht. Nicht über entzündete Haut oder frische Narben. Nach Gebrauch abwaschen, trocken legen. Nicht fallen lassen.",
      "Clean face, oil or cream, keep the stone flat, centre to edge, light pressure. Not over inflamed skin or new scars. Wash after, dry it. Do not drop it."
    ),
  },
  "ceremonial-cacao-paste": {
    about: t(
      "500 g reine Criollo-Kakaomasse aus Guatemala, steingemahlen, wenig verarbeitet. Zum Trinken als zeremonieller Kakao oder als täglicher Trunk, nicht gesüßt und nicht entölt. Das ist Lebensmittel, keine Medizin.",
      "500 g pure Criollo cacao paste from Guatemala, stone-ground, minimally processed. For a ceremonial drink or a daily cup, unsweetened and not defatted. This is food, not medicine."
    ),
    make: t(
      "Kakaobohnen werden fermentiert, getrocknet, geröstet oder leicht erwärmt, geschält und auf Stein zu einer Masse gemahlen. Ohne Zugabe von Milch, Zucker oder Lecithin in diesem Stück. 500 g ist die Nettofüllung.",
      "Cacao beans are fermented, dried, roasted or gently warmed, hulled and stone-ground into a paste. No milk, sugar or lecithin in this block. 500 g is the net fill."
    ),
    use: t(
      "Stück abbrechen, in heißem Wasser oder leichter Pflanzenmilch schmelzen, schlagen. Menge selbst wählen; zeremoniell oft höher als ein Trinkkakao. Nicht für Hunde. Trocken und kühl lagern. Bei Unverträglichkeit von Kakao weglassen.",
      "Break a piece, melt it in hot water or light plant milk, whisk. Dose it yourself; ceremonial cups are often stronger than a drinking cocoa. Not for dogs. Store cool and dry. Skip it if cacao does not sit well with you."
    ),
  },
  "matcha-ceremonial-grade": {
    about: t(
      "30 g Erstpflücke, schattierter Matcha aus Uji, Japan. Das Pulver ist fein, der Geschmack umami, die Farbe satt. Zeremonielle Stufe heißt: für die Schale, nicht als Backzutat gedacht.",
      "30 g first-harvest, shade-grown matcha from Uji, Japan. The powder is fine, the taste umami, the colour deep. Ceremonial grade means: for the bowl, not as a baking dye."
    ),
    make: t(
      "Die Sträucher werden vor der Ernte beschattet, die jungen Blätter gedämpft, getrocknet, entrippt und auf Stein zu Pulver gemahlen. Uji ist das angegebene Anbaugebiet. 30 g Dose, lichtgeschützt.",
      "The bushes are shaded before harvest; young leaves are steamed, dried, deveined and stone-milled to powder. Uji is the stated growing area. 30 g tin, kept from light."
    ),
    use: t(
      "1–2 g ins Schälchen, wenig heißes, nicht kochendes Wasser, mit dem Besen schlagen, bis Schaum steht. Oder als dünner Usucha. Dose schließen, kühl und dunkel. Nicht monatelang offen stehen lassen.",
      "1–2 g in a bowl, a little hot, not boiling water, whisk to a foam. Or as thin usucha. Close the tin, keep it cool and dark. Do not leave it open for months."
    ),
  },
  "adaptogen-blend": {
    about: t(
      "Pulvermischung aus Ashwagandha, Reishi, Lion’s Mane und Rhodiola, 60 Portionen. Sie ist ein Lebensmittelpulver zum Einrühren, kein Arzneimittel. Die Pflanzen stehen auf der Dose; es gibt keine zugesetzten Aromen in der Kurzbeschreibung.",
      "A powder of ashwagandha, reishi, lion’s mane and rhodiola, 60 servings. It is a food powder to stir in, not a medicine. The plants are the ones named; the short copy does not list extra flavours."
    ),
    make: t(
      "Die genannten Fruchtkörper bzw. Wurzeln werden getrocknet und gemahlen oder als Extrakt zugegeben und gemischt. 60 Portionen beziehen sich auf die angegebene Dosis auf der Packung, nicht auf eine Labortherapie.",
      "The named fruiting bodies or roots are dried and milled or added as extract and blended. 60 servings refers to the stated dose on the pack, not to a clinic protocol."
    ),
    use: t(
      "Die angegebene Menge in Wasser, Kakao oder Brei rühren. Nicht die Dosis still erhöhen. Bei Schwangerschaft, Medikamenten oder Unsicherheit weglassen oder nachfragen. Trocken lagern.",
      "Stir the stated amount into water, cacao or porridge. Do not raise the dose on your own. Skip or ask if you are pregnant, on medication or unsure. Store dry."
    ),
  },
  "herbal-tea-collection": {
    about: t(
      "Sechs lose Kräutermischungen in Dosen zu je 30 g: Sleep, Focus, Calm, Digest, Vital, Glow. Bio, von Hand gemischt. Das sind Tees zum Aufgießen, keine Kapseln.",
      "Six loose herbal blends in 30 g tins: Sleep, Focus, Calm, Digest, Vital, Glow. Organic, hand-blended. These are teas to steep, not capsules."
    ),
    make: t(
      "Getrocknete Kräuter und Blüten werden nach Rezept gewogen und in 30-g-Dosen gefüllt. Sechs Rezepte, sechs Dosen. Kein Aromaöl über das Kraut hinaus in der Beschreibung.",
      "Dried herbs and flowers are weighed to recipe and filled into 30 g tins. Six recipes, six tins. No extra flavour oil is listed beyond the plant."
    ),
    use: t(
      "Einen Tee löffel oder nach Geschmack aufgießen, ziehen lassen, abseihen. Abends Sleep, tagsüber die anderen nach Bedarf. Die Namen beschreiben die Mischung, nicht eine geprüfte Wirkung. Trocken halten.",
      "Steep a spoon or to taste, wait, strain. Sleep in the evening, the others by day as you like. The names describe the blend, not a proven effect. Keep dry."
    ),
  },
  "book-body-keeps-score": {
    about: t(
      "Bessel van der Kolk beschreibt, wie Traumafolgen Körper und Gehirn mitformen und welche Behandlungswege er und andere untersucht haben. Taschenbuchausgabe. Es ist ein Sachbuch, kein Workbook mit ORIVE-Protokoll.",
      "Bessel van der Kolk writes how trauma shapes body and brain, and which treatments he and others have studied. Paperback. It is a nonfiction book, not an ORIVE workbook."
    ),
    make: t(
      "Gedrucktes Taschenbuch, Klebe- oder Fadenbindung je nach Auflage. Text und Apparat stammen vom Verlag der englischen Ausgabe. ORIVE ändert den Text nicht.",
      "A printed paperback, perfect- or sewn-bound depending on the printing. Text and apparatus come from the English-edition publisher. ORIVE does not alter the text."
    ),
    use: t(
      "Lesen, Stellen markieren, in der eigenen Praxis nur das nutzen, wofür du ausgebildet können. Nicht als Anleitung zur Traumabehandlung ohne Ausbildung. Papier, kein Hörbuch-Code in diesem Artikel.",
      "Read it, mark passages, use in your own work only what you are trained to hold. Not a trauma-treatment manual if you are not trained. Paper, no audiobook code in this listing."
    ),
  },
  "book-breath-james-nestor": {
    about: t(
      "James Nestor erzählt Recherche und Versuche zur Atmung: Geschichte, Labore, eigene Experimente. Taschenbuch. Ein Lesebuch für die Praxis, kein medizinischer Leitfaden.",
      "James Nestor reports research and experiments on breathing: history, labs, his own trials. Paperback. A reading book for practice, not a clinical guideline."
    ),
    make: t(
      "Standard-Taschenbuch der englischen Ausgabe. Satz, Druck und Einband kommen vom Verlag. Kein beigelegtes Gerät.",
      "A standard English paperback. Type, print and binding come from the publisher. No device is included."
    ),
    use: t(
      "Kapitelweise lesen, Übungen nur, wenn sie im Text klar und für dich unbedenklich sind. Zusammen mit Journal oder Timer, nicht statt Abklärung bei Beschwerden.",
      "Read it by chapter; try exercises only when the text is clear and they sit well with you. Use it with a journal or timer, not in place of care if you have symptoms."
    ),
  },
  "book-wim-hof-method": {
    about: t(
      "Wim Hof legt Kälte, Atmung und Haltung so dar, wie er die Methode lehrt. Illustriert, Taschenbuch. Der Text ist die Buchfassung, kein Kurszugang.",
      "Wim Hof sets out cold, breathing and mindset as he teaches the method. Illustrated paperback. The text is the book, not a course login."
    ),
    make: t(
      "Gedrucktes Taschenbuch mit Abbildungen. Herstellung beim Verlag. ORIVE liefert das Buch, nicht das Eisbad dazu.",
      "A printed paperback with figures. Made at the publisher. ORIVE sells the book, not the ice bath with it."
    ),
    use: t(
      "Lesen, Atem- und Kälteübungen nur in dem Rahmen, den du kennst und der für dich tragbar ist. Nie hyperventilieren im Wasser. Das Buch ersetzt keinen angeleiteten Kurs, wenn du neu bist.",
      "Read it; use breath and cold work only in a range you know and can hold. Never hyperventilate in water. The book does not replace a taught course if you are new."
    ),
  },
  "book-yoga-sutras": {
    about: t(
      "Sri Swami Satchidanandas Übersetzung der Yoga-Sutras mit Kommentar. Taschenbuch. Grundlage für Philosophie und Praxis, kein Asana-Atlas.",
      "Sri Swami Satchidananda’s translation of the Yoga Sutras with commentary. Paperback. A base for philosophy and practice, not an asana atlas."
    ),
    make: t(
      "Taschenbuch der englischen Ausgabe, Satz und Druck vom Verlag. Sanskrit, Übersetzung und Kommentar stehen im Band, wie der Verlag sie setzt.",
      "English paperback; type and print from the publisher. Sanskrit, translation and commentary sit in the volume as the publisher set them."
    ),
    use: t(
      "Sutra für Sutra lesen, Kommentar daneben. Im Unterricht zitieren, wenn du den Text kennst. Kein Ersatz für einen Lehrer, wenn du den Sanskrit-Kontext neu aufschlägst.",
      "Read sutra by sutra with the commentary. Quote it in class if you know the text. Not a substitute for a teacher if the Sanskrit context is new to you."
    ),
  },
  "cork-yoga-wheel": {
    about: t(
      "Ein massives Korkrad, 33 cm Durchmesser, 13 cm breit, angegeben bis 150 kg. Für Rückbeugen und Schulteröffnung, als Rolle unter der Brustwirbelsäule. Kein Spielrad.",
      "A solid cork dharma wheel, 33 cm across, 13 cm wide, stated to 150 kg. For backbends and shoulder opening, as a roll under the thoracic spine. Not a toy wheel."
    ),
    make: t(
      "Kork wird zu einem Zylinder gepresst oder geschichtet und auf Maß gedreht. Kein Kunststoffreifen außen. Die Tragangabe 150 kg steht für statisches Liegen, nicht für Sprünge.",
      "Cork is pressed or layered into a cylinder and turned to size. No plastic tyre on the outside. The 150 kg figure is for static lying, not for jumping."
    ),
    use: t(
      "Rad hinter die Brustwirbelsäule, langsam in die Beuge, Hände zum Boden oder an den Rand. Nicht mit Schwung draufspringen. Auf rutschfester Matte. Trocken abwischen.",
      "Wheel behind the thoracic spine, ease into the bend, hands to the floor or the rim. Do not jump onto it. On a non-slip mat. Wipe dry."
    ),
  },
  "yoga-towel-organic": {
    about: t(
      "Ein rutschfestes Mikrofaser-Handtuch für heiße Stunden, 183 × 61 cm, mit Silikonpunkten auf der Unterseite. Es liegt auf der Matte, ersetzt sie nicht.",
      "A non-slip microfibre towel for hot class, 183 × 61 cm, with silicone dots on the underside. It sits on the mat; it does not replace it."
    ),
    make: t(
      "Mikrofasergewebe, Unterseite mit Silikonpunkten für Halt auf der Matte. Zugeschnitten auf Mattenlänge. Maschinenwaschbar laut Angabe.",
      "Microfibre cloth, underside dotted with silicone for grip on the mat. Cut to mat length. Machine-washable as stated."
    ),
    use: t(
      "Auf die trockene Matte legen, Punkte nach unten. Nach der Stunde waschen oder hängen. Nicht als Badetuch ins Chlor, wenn du die Punkte schonen willst.",
      "Lay it on a dry mat, dots down. Wash or hang it after class. Do not use it as a pool towel in chlorine if you want to keep the dots."
    ),
  },
  "yoga-blanket-cotton": {
    about: t(
      "Dicht gewebte Baumwolldecke, 150 × 200 cm, für Restauration und Savasana. Waschbar. Gewicht und Webart geben Halt unter Knien oder über dem Rumpf.",
      "A tightly woven cotton throw, 150 × 200 cm, for restoration and savasana. Machine washable. Weight and weave hold under the knees or over the torso."
    ),
    make: t(
      "Baumwolle wird fest gewebt und auf 150 × 200 cm geschnitten. Keine Fleece-Schicht. Die Decke ist zum Falten und Unterlegen gedacht, nicht als leichte Sommerdecke allein.",
      "Cotton is woven tight and cut to 150 × 200 cm. No fleece layer. The blanket is for folding and propping, not only as a light summer throw."
    ),
    use: t(
      "Gefaltet unter Kopf, Knie oder Becken; ausgebreitet als Decke in Savasana. Waschen, wie das Etikett sagt, nicht heiß schleudern, wenn du die Webart halten willst.",
      "Folded under head, knees or pelvis; spread as a cover in savasana. Wash as the label says; skip a hot spin if you want the weave to hold."
    ),
  },
  "yoga-wedge-cork": {
    about: t(
      "Keil aus Kork, 30 × 15 × 7 cm, für Handgelenke, Knie und sitzende Vorwärtsbeugen. Die Schräge nimmt Winkel weg, die der Boden nicht hergibt.",
      "A cork wedge, 30 × 15 × 7 cm, for wrists, knees and seated folds. The slope takes angles the floor will not give."
    ),
    make: t(
      "Kork wird zu einem Keil geschnitten und geschliffen. Massiv, ohne Schaumkern. Die Maße sind fest: 30 cm lang, 15 cm tief, 7 cm hoch an der starken Kante.",
      "Cork is cut and sanded into a wedge. Solid, no foam core. The size is fixed: 30 cm long, 15 cm deep, 7 cm at the tall edge."
    ),
    use: t(
      "Unter die Handballen in Planke und Hund, unter das Knie, unter das Becken in der Vorbeuge. Die hohe Kante zeigt dorthin, wo du Höhe brauchst. Trocken halten.",
      "Under the heels of the hands in plank and dog, under a knee, under the pelvis in a fold. The tall edge faces where you need height. Keep it dry."
    ),
  },
  "neti-pot-stainless": {
    about: t(
      "Kanne aus lebensmittelechtem Edelstahl, 250 ml, mit Messlöffel, für die Nasenspülung. Kein Kunststoffkörper. Sie führt Salzwasser durch die Nase, sonst nichts.",
      "A food-grade stainless pot, 250 ml, with a measuring spoon, for nasal rinse. No plastic body. It moves saline through the nose, nothing else."
    ),
    make: t(
      "Edelstahl wird zu Kanne und Tülle geformt, 250 ml Nutzvolumen. Der Löffel liegt bei für die Salzdosierung. Kein Schlauch, keine Pumpe.",
      "Stainless steel is formed into pot and spout, 250 ml working volume. The spoon is for the salt dose. No tube, no pump."
    ),
    use: t(
      "Lauwarme Salzlösung, über dem Waschbecken, eine Nase ein, die andere aus, dann wechseln. Nur klares Spülrezept, kein Leitungswasser ohne Abkochen oder Sterilwasser, wenn das bei dir gilt. Bei Ohrdruck oder Unsicherheit lassen. Nach Gebrauch ausspülen, trocknen.",
      "Lukewarm saline, over a sink, in one nostril, out the other, then switch. Use a clear rinse recipe; do not use untreated tap water if that rule applies where you live. Skip it with ear pressure or if you are unsure. Rinse and dry after."
    ),
  },
  "breath-trainer-resist": {
    about: t(
      "Atemwiderstandsgerät mit einstellbarem Ein- und Ausatmen, Mundstück aus lebensmittelechtem Silikon. Zum Training der Atemmuskulatur, nicht zum Messen der Lunge.",
      "A breath-resistance trainer with adjustable inhale and exhale, food-grade silicone mouthpiece. For training the breathing muscles, not for measuring the lung."
    ),
    make: t(
      "Gehäuse mit Ventilen oder Blenden, Mundstück Silikon. Der Widerstand wird am Gerät gestellt, nicht in einer App. Kein Sauerstoffanschluss.",
      "A housing with valves or apertures, silicone mouthpiece. Resistance is set on the device, not in an app. No oxygen port."
    ),
    use: t(
      "Mundstück einsetzen, Widerstand niedrig beginnen, Sätze wie in deiner Anleitung. Nicht während schwerer Belastung unbekannt hochdrehen. Mundstück reinigen, trocknen. Bei Schwindel aufhören.",
      "Fit the mouthpiece, start resistance low, work sets as you were taught. Do not jump the setting under heavy load if you do not know it. Clean and dry the mouthpiece. Stop if you feel faint."
    ),
  },
  "breathwork-cards": {
    about: t(
      "52 Karten auf Recyclingkarton: Box, 4-7-8, kohärentes Atmen, Haltungen. Ein Stapel zum Ziehen, kein Kurs. Die Texte sind Stichworte, keine Diagnose.",
      "52 cards on recycled stock: box, 4-7-8, coherent breathing, holds. A deck to draw from, not a course. The lines are cues, not a diagnosis."
    ),
    make: t(
      "Karton aus Recyclingfaser, bedruckt, geschnitten, als Deck verpackt. 52 Blatt. Kein QR-Zwang in der Beschreibung.",
      "Recycled board, printed, cut, packed as a deck. 52 leaves. No QR requirement is listed."
    ),
    use: t(
      "Eine Karte ziehen, Timer stellen, Protokoll folgen. Im Journal festhalten. Karten trocken halten, nicht laminieren müssen. Haltprotokolle nur, wenn du sie kennst.",
      "Draw a card, set a timer, follow the protocol. Log it in the journal. Keep the cards dry; you do not have to laminate them. Hold protocols only if you know them."
    ),
  },
  "pulse-oximeter": {
    about: t(
      "Fingerclip für SpO2 und Puls, OLED, zwei AAA-Batterien liegen bei. Zum Ablesen während gehaltener Atemzüge, nicht als Klinikmonitor und nicht zur Selbstdiagnose.",
      "A finger clip for SpO2 and pulse, OLED, two AAA batteries included. For readout during timed holds, not a ward monitor and not for self-diagnosis."
    ),
    make: t(
      "Gehäuse, Lichtsensor, Display, Batteriefach. Die Messung ist die übliche Pulsoximetrie am Finger. Keine Speicherkette in die Cloud in der Beschreibung.",
      "Case, light sensor, display, battery bay. The reading is ordinary finger pulse oximetry. No cloud store is listed."
    ),
    use: t(
      "Finger einschieben, Wert abwarten, notieren. Kalte Finger wärmen. Nicht als Freigabe für extreme Halte nutzen. Batterien wechseln, wenn das Display nachlässt.",
      "Slide a finger in, wait for the number, write it down. Warm cold fingers. Do not treat it as clearance for extreme holds. Change batteries when the display fades."
    ),
  },
  "ice-barrel-home": {
    about: t(
      "Aufrechtes Isolierfass für sitzende Kälte, 80 cm hoch, Ablauf unten. Du sitzt, tauchst nicht wie in einer liegenden Wanne. Keine eingebaute Kältemaschine in der Beschreibung.",
      "An upright insulated barrel for seated cold, 80 cm high, drain at the base. You sit; you do not lie as in a long tub. No built-in chiller is listed."
    ),
    make: t(
      "Isolierwand, Innenbehälter, Ablaufstutzen. Höhe 80 cm für das Sitzen. Zusammenbau nach Anleitung. Kälte durch Wasser und Eis.",
      "Insulated wall, inner vessel, drain fitting. 80 cm height for sitting. Assemble as instructed. Cold from water and ice."
    ),
    use: t(
      "Eben aufstellen, füllen, Temperatur messen, einsteigen, sitzen, aussteigen, wärmen. Ablauf zum Leeren. Nicht abdecken mit dem Kopf unter Wasser, wenn du allein und unsicher bist.",
      "Set it level, fill, measure, step in, sit, step out, warm up. Use the drain to empty. Do not cover so the head is under water if you are alone and unsure."
    ),
  },
  "merino-recovery-socks": {
    about: t(
      "Wadenhohe Socken, 70 % Merino, Größe 38–45, zum Wärmen nach der Kälte. Kein Kompressionsstrumpf mit medizinischer Klasse in der Angabe.",
      "Mid-calf socks, 70% merino, size 38–45, for warming after cold. Not a medical-class compression stocking in the listing."
    ),
    make: t(
      "Merinogarn mit Begleitfaser auf Sockenmaschinen, 70 % Merinoanteil. Paar, eine Größe 38–45. Keine Heizsohle.",
      "Merino yarn with a companion fibre on sock machines, 70% merino. A pair, one size 38–45. No heated sole."
    ),
    use: t(
      "Nach dem Aussteigen anziehen, bevor die Füße weiter auskühlen. Waschen nach Etikett, nicht auf die Heizung brennen. Zum Gehen nach der Session, nicht als Neoprenersatz im Wasser.",
      "Put them on as you step out, before the feet keep losing heat. Wash as labelled; do not bake them on a radiator. For walking after the session, not as neoprene in the water."
    ),
  },
  "ice-bath-gloves": {
    about: t(
      "Handschuhe aus 3 mm Neopren mit Grifffläche, eine Größe, für lange Haltungen im kalten Wasser. Sie schützen die Hände, nicht den Kreislauf.",
      "3 mm neoprene gloves with grip palms, one size, for long holds in cold water. They spare the hands, not the circulation."
    ),
    make: t(
      "Neopren zugeschnitten, genäht oder geklebt, Innenhand mit Griff. 3 mm Stärke. Eine Größe, nicht nach Handmaß sortiert.",
      "Neoprene cut, sewn or glued, palm with grip. 3 mm thickness. One size, not graded by hand measure."
    ),
    use: t(
      "Trocken anziehen, dann ins Wasser. Nach Gebrauch auswaschen, umstülpen, trocknen. Nicht als Ofenschutz.",
      "Put them on dry, then enter the water. Rinse after, turn out, dry. Not for oven work."
    ),
  },
  "wool-recovery-beanie": {
    about: t(
      "Unstrukturierte Merinomütze für die Zeit nach der Kälte, eine Größe. Kopf wärmen, Haar trocken halten. Kein Helm.",
      "An unstructured merino beanie for after cold, one size. Warm the head, keep hair drier. Not a helmet."
    ),
    make: t(
      "Merinogestrick, in Form einer Beanie, ungefüttert in der Beschreibung. Eine Größe.",
      "Merino knit in a beanie shape, unlined in the listing. One size."
    ),
    use: t(
      "Sofort nach dem Abtrocknen des Haars aufsetzen. Schonend waschen. Nicht nass in die Wanne mitnehmen, wenn du sie trocken halten willst.",
      "Put it on once the hair is towelled. Wash gently. Do not take it into the tub if you want it dry."
    ),
  },
  "koshi-chime-terra": {
    about: t(
      "Handgestimmte Bambusklangröhre in der Terra-Skala, 35 cm, mit Hanfaufhänger. Ein hängendes Instrument, kein Windspiel aus Plastik.",
      "A hand-tuned bamboo chime in the Terra scale, 35 cm, with a hemp hanger. A hanging instrument, not a plastic garden chime."
    ),
    make: t(
      "Bambusröhren werden auf die Terra-Skala gestimmt und in den Körper gehängt, Hanfschnur zum Aufhängen. 35 cm Gesamtlänge. Jede Röhre ist auf Ton gebracht, nicht zufällig geschnitten.",
      "Bamboo tubes are tuned to the Terra scale and hung in the body, hemp cord to hang it. 35 cm overall. Each tube is brought to pitch, not cut at random."
    ),
    use: t(
      "Aufhängen, anstoßen oder im Luftzug, Ton ausklingen lassen. Drinnen oder geschützt draußen. Nicht als Kinderspielzeug mit festem Ziehen.",
      "Hang it, tap it or let a draft move it, let the tones decay. Indoors or in shelter. Not a toy to yank."
    ),
  },
  "frame-drum-30": {
    about: t(
      "Rahmen-Trommel, 30 cm, Ziegenfell auf Hartholzreifen, Filzschlägel dabei. Zum Schlagen mit der Hand oder dem Schlägel, nicht elektronisch verstärkt.",
      "A frame drum, 30 cm, goatskin on a hardwood hoop, felt mallet included. For hand or mallet, not a wired kit."
    ),
    make: t(
      "Hartholzreifen, Fell aufgezogen, gestimmt über die Spannung des Fells. 30 cm Durchmesser. Schlägel mit Filzkopf. Feuchte ändert die Spannung.",
      "Hardwood hoop, skin stretched and tensioned. 30 cm across. Mallet with a felt head. Humidity changes the tension."
    ),
    use: t(
      "Auf dem Schoß oder vor dem Körper, Hand oder Schlägel. Für Öffnen und Schließen einer Stunde. Fell trocken halten, nicht auf die Heizung legen.",
      "On the lap or in front of the body, hand or mallet. For opening and closing a session. Keep the skin dry; do not leave it on a radiator."
    ),
  },
  "tingsha-cymbals": {
    about: t(
      "Zwei 7-cm-Zimbeln aus Bronze an einem Lederband. Heller, kurzer Oberton zum Markieren von Anfang und Ende. Kein Orchesterbecken.",
      "A pair of 7 cm bronze cymbals on a leather strap. A bright, short overtone to mark start and end. Not orchestral crash cymbals."
    ),
    make: t(
      "Bronze gegossen oder geschmiedet, auf 7 cm, mit Leder verbunden. Die Paarung bestimmt den Schlagton. Kein Filz zwischen den Tellern in der Grundausstattung.",
      "Bronze cast or forged to 7 cm, joined with leather. The pairing sets the strike tone. No felt between the plates in the basic set."
    ),
    use: t(
      "An den Bändern halten, einmal zusammenführen, ausklingen lassen. In der Stille, nicht als Dauerklang. Trocken abwischen.",
      "Hold the straps, bring them together once, let them ring out. In silence, not as a loop. Wipe dry."
    ),
  },
  "rainstick-wood": {
    about: t(
      "60 cm Kaktus-Regenstab mit Samenfüllung. Ein absteigendes Rauschen für Anfang und Ende. Kein Lautsprecher, kein Loop-Gerät.",
      "A 60 cm cactus rainstick with seed fill. A falling wash for openings and closings. Not a speaker, not a loop box."
    ),
    make: t(
      "Ein getrockneter Kaktuskörper, innen Dorne oder Stifte, Samen oder Kies als Füllung, außen Holzbild. 60 cm Länge. Jeder Stab rauscht etwas anders.",
      "A dried cactus body, spines or pins inside, seed or grit as fill, wood look outside. 60 cm long. Each stick washes a little differently."
    ),
    use: t(
      "Langsam kippen, das Rauschen durchlaufen lassen, umdrehen. Für den Raum, nicht als Taktgeber im Millisekundenbereich. Trocken lagern, nicht schlagen wie eine Keule.",
      "Tilt it slowly, let the wash run, turn it. For the room, not as a millisecond click. Store dry; do not swing it as a club."
    ),
  },
  "zen-garden-mini": {
    about: t(
      "Tischgarten: Sand, Rechen, vier Steine, Holztablett, 22 cm. Zum Ziehen von Linien, nicht zum Bepflanzen. Ein Gegenstand für Pausen, kein Landschaftsbau.",
      "A desktop garden: sand, rake, four stones, wooden tray, 22 cm. For drawing lines, not for planting. A pause object, not landscaping."
    ),
    make: t(
      "Tablett aus Holz, Sandfüllung, kleiner Rechen, vier Steine. 22 cm Durchmesser bzw. Weite. Keine Pflanzen, keine Elektronik.",
      "Wooden tray, sand, a small rake, four stones. 22 cm across. No plants, no electronics."
    ),
    use: t(
      "Sand ebenen, Rechen ziehen, Steine setzen, wieder ebenen. Auf dem Schreibtisch, nicht im Wind. Sand nicht essen, nicht saugen mit dem Staubsauger ohne Aufsatz.",
      "Level the sand, rake, place stones, level again. On a desk, not in a draft. Do not eat the sand; do not vacuum it without a nozzle you control."
    ),
  },
  "seiza-meditation-bench": {
    about: t(
      "Klappbare Bank aus Buche für den Kniesitz, Sitzhöhe 20 cm. Sie nimmt Gewicht von den Unterschenkeln und lässt den Rücken aufrecht. Kein Stuhl mit Lehne.",
      "A folding beech bench for kneeling sits, seat 20 cm high. It takes load off the shins and lets the back stay upright. Not a chair with a back."
    ),
    make: t(
      "Buchenholz, Sitz und Beine, Klappgelenk. 20 cm Sitzhöhe. Geschliffen, ohne Polster in der Grundform. Scharnier festziehen, wenn es spielt.",
      "Beech, seat and legs, a folding joint. 20 cm seat height. Sanded, no pad in the base form. Tighten the hinge if it plays."
    ),
    use: t(
      "Bank aufklappen, Knien, Gesäß auf den Sitz, Füße gerade nach hinten. Weiches Tuch unter die Schienbeine, wenn der Boden hart ist. Nicht als Trittleiter.",
      "Open the bench, kneel, sit the pelvis on the seat, feet straight back. A cloth under the shins if the floor is hard. Not a step stool."
    ),
  },
  "brass-incense-burner": {
    about: t(
      "Messinggefäß mit Deckel und Sandschale, 8 cm, für Stäbchen und Harz. Es hält Glut und Asche, nicht den Raum allein frei von Rauch.",
      "A lidded brass censer with a sand cup, 8 cm, for sticks and resin. It holds ember and ash; it does not clear the room of smoke on its own."
    ),
    make: t(
      "Messing gedrückt oder gegossen, Deckel, innere Schale für Sand. 8 cm Weite. Kein elektrisches Räuchern.",
      "Brass pressed or cast, lid, inner cup for sand. 8 cm across. No electric incense."
    ),
    use: t(
      "Sand einfüllen, Stäbchen oder Kohle plus Harz, Deckel nach Bedarf. Auf Unbrennbares stellen, nicht unbeaufsichtigt. Nach dem Erkalten leeren.",
      "Fill sand, set a stick or coal plus resin, lid as needed. On a non-flammable surface, never leave it. Empty when cold."
    ),
  },
  "zabuton-floor-cushion": {
    about: t(
      "Bodensitz 70 × 80 × 8 cm, Baumwolle, Bezug abnehmbar. Unter Zafu oder Bank, damit Knöchel und Knie nicht auf dem Holzboden liegen. Kein Matratzensatz.",
      "A floor mat 70 × 80 × 8 cm, cotton, removable cover. Under a zafu or bench so ankles and knees are not on bare wood. Not a mattress set."
    ),
    make: t(
      "Kern aus Fasern oder Baumwolle, Bezug mit Reißverschluss, Format 70 × 80 cm, 8 cm hoch. Rechteck, nicht rund. Der Bezug geht zum Waschen ab.",
      "A fibre or cotton core, zipped cover, 70 × 80 cm, 8 cm high. Rectangle, not round. The cover comes off to wash."
    ),
    use: t(
      "Flach auf den Boden, Zafu oder Bank darauf, sitzen. Bezug waschen, Kern lüften. Nicht als Gastmatratze für Nächte stapeln, wenn der Kern dafür nicht gedacht ist.",
      "Flat on the floor, zafu or bench on top, sit. Wash the cover, air the core. Do not stack it as a guest mattress if the core is not made for nights."
    ),
  },
  "grounding-desk-mat": {
    about: t(
      "Leitfähige PU-Schreibtischmatte, 30 × 20 cm, mit 2 m Erdungskabel. Sie verbindet die Matte mit einem Erdungspunkt, sofern der Anschluss bei dir zulässig und korrekt ist. Kein Heilgerät.",
      "A conductive PU desk mat, 30 × 20 cm, with a 2 m earth cord. It ties the mat to an earth point if that connection is allowed and correct where you are. Not a healing device."
    ),
    make: t(
      "PU-Schicht mit leitfähiger Lage, Kabel 2 m, Anschluss an Erde. 30 × 20 cm Arbeitsfläche. Keine Batterie.",
      "PU with a conductive layer, 2 m cord, earth connection. 30 × 20 cm work area. No battery."
    ),
    use: t(
      "Matte auf den Tisch, Kabel nur an eine vorgesehene Erde, Unterarme auf die Matte. Nicht in die Steckdose improvisieren, wenn du den Anschluss nicht kennst. Trocken halten.",
      "Mat on the desk, cord only to a proper earth, forearms on the mat. Do not improvise a wall-socket hack if you do not know the wiring. Keep dry."
    ),
  },
  "fascia-massage-stick": {
    about: t(
      "45 cm Rollstab mit Holzgriffen und profilierter Mitte für Waden und Oberschenkel. Du rollst den Muskel unter dem Stab, nicht den Stab über die Wirbelsäule.",
      "A 45 cm rolling stick with hardwood handles and a textured centre for calves and quads. You roll the muscle under the stick, not the stick over the spine."
    ),
    make: t(
      "Hartholzgriffe, Mittelteil mit Struktur, 45 cm Länge. Mechanisch, ohne Motor. Die Griffe sind zum Führen, nicht zum Schlagen.",
      "Hardwood handles, textured midsection, 45 cm long. Mechanical, no motor. The handles are for steering, not for hitting."
    ),
    use: t(
      "Stab auf den Muskel, Druck mit den Armen, langsam längs der Faser. Waden im Sitzen, Quads im Stand. Nicht auf Knochen und nicht auf frische Verletzungen. Abwischen.",
      "Stick on the muscle, pressure from the arms, slowly along the fibre. Calves seated, quads standing. Not on bone, not on a fresh injury. Wipe it."
    ),
  },
  "inversion-table": {
    about: t(
      "Klappbare Inversionsbank mit Fußaufnahme und Winkelstift, Stahlrahmen, für Körpergröße 150–190 cm. Du hängst in einstellbarem Winkel, nicht frei ohne Sicherung. Aufbau und Gurte nach Anleitung.",
      "A folding inversion bench with ankle lock and angle pin, steel frame, for height 150–190 cm. You hang at a set angle, not free without the lock. Assemble and strap as instructed."
    ),
    make: t(
      "Stahlrahmen, Liegefläche, Fußschlösser, Rastung für den Winkel. Klappbar zum Stellen. Kein Motor. Die Größenangabe 150–190 cm begrenzt die Nutzung.",
      "Steel frame, bed, ankle locks, a pin for the angle. Folds to store. No motor. The 150–190 cm range limits who it fits."
    ),
    use: t(
      "Aufbauen, Größe einstellen, Füße sichern, zuerst flache Winkel, jemand in Rufweite, wenn du neu bist. Bei Bluthochdruck, Glaukom, Schwangerschaft oder Unsicherheit nicht nutzen, ohne das geklärt zu haben. Nicht springen lassen.",
      "Build it, set height, lock the feet, start at shallow angles, someone in earshot if you are new. Do not use it with high blood pressure, glaucoma, pregnancy or doubt until that is cleared. Do not bounce it."
    ),
  },
  "marine-collagen-300": {
    about: t(
      "300 g unaromatisierte Fischkollagenpeptide, 30 Portionen. Neutral in Wasser oder Kakao. Lebensmittelpulver, kein Gelenkersatz aus der Apotheke.",
      "300 g unflavoured fish collagen peptides, 30 servings. Neutral in water or cacao. A food powder, not a pharmacy joint replacement."
    ),
    make: t(
      "Kollagen aus Fisch wird hydrolysiert zu Peptiden und getrocknet. 300 g Dose, 30 Portionen laut Angabe. Ohne Geschmackszusatz in der Beschreibung.",
      "Fish collagen is hydrolysed to peptides and dried. 300 g tin, 30 servings as stated. No flavour is listed."
    ),
    use: t(
      "Die Portionsmenge in kaltes oder lauwarmes Wasser oder Kakao rühren. Nicht überhitzen, wenn du Klumpen vermeiden willst. Bei Fischallergie weglassen. Trocken lagern.",
      "Stir the serving into cold or lukewarm water or cacao. Do not scorch it if you want it smooth. Skip it if you are allergic to fish. Store dry."
    ),
  },
  "lions-mane-powder": {
    about: t(
      "100 g Fruchtkörperpulver, Doppel-Extrakt, 50 Portionen zu 2 g. Speisepilzpulver zum Einrühren. Kein diagnostisches Nootropikum.",
      "100 g fruiting-body powder, dual extract, 50 servings at 2 g. An edible mushroom powder to stir in. Not a diagnostic nootropic."
    ),
    make: t(
      "Fruchtkörper von Hericium, heiß und/oder alkoholisch extrahiert (Doppel-Extrakt), getrocknet, 100 g. 2 g als Portionsangabe.",
      "Hericium fruiting body, hot-water and/or alcohol extracted (dual extract), dried, 100 g. 2 g is the stated serving."
    ),
    use: t(
      "2 g in Wasser, Kakao oder Essen. Nicht still vervielfachen. Bei Unsicherheit oder Medikamenten nachfragen. Trocken halten.",
      "2 g in water, cacao or food. Do not multiply the dose on your own. Ask if you are unsure or on medication. Keep dry."
    ),
  },
  "reishi-extract": {
    about: t(
      "60 g Heißwasserextrakt vom roten Reishi, 60 Portionen zu 1 g. Bitter, zum Einrühren. Lebensmittel, kein verschriebenes Mittel.",
      "60 g hot-water extract of red reishi, 60 servings at 1 g. Bitter, for stirring in. Food, not a prescribed drug."
    ),
    make: t(
      "Roter Reishi wird mit heißem Wasser ausgezogen, der Extrakt getrocknet. 60 g, 1 g Portion. Kein Fruchtzucker in der Kurzbeschreibung.",
      "Red reishi is drawn in hot water and the extract dried. 60 g, 1 g serving. No fruit sugar is listed in the short copy."
    ),
    use: t(
      "1 g in heißes Wasser oder Kakao. Geschmack ist bitter; das ist der Extrakt, kein Fehler. Bei Unsicherheit weglassen. Trocken lagern.",
      "1 g in hot water or cacao. The taste is bitter; that is the extract, not a fault. Skip it if you are unsure. Store dry."
    ),
  },
  "book-why-we-sleep": {
    about: t(
      "Matthew Walker schreibt über Schlafarchitektur, Erholung und Aufmerksamkeit. Taschenbuch, englische Ausgabe. Ein Sachbuch zum Lesen, kein Schlaflabor und kein Tracker.",
      "Matthew Walker writes on sleep architecture, recovery and attention. Paperback, English edition. A book to read, not a sleep lab and not a tracker."
    ),
    make: t(
      "Gedrucktes Taschenbuch der englischen Ausgabe. Satz und Druck liegen beim Verlag. ORIVE ändert den Text nicht und legt kein Gerät bei.",
      "A printed English paperback. Type and print sit with the publisher. ORIVE does not change the text and includes no device."
    ),
    use: t(
      "Kapitelweise lesen, eigene Schlafzeiten danebenhalten, ohne den Text als Diagnose zu nehmen. Zusammen mit fester Bettzeit nützen, nicht statt Abklärung bei anhaltenden Beschwerden.",
      "Read it by chapter, hold it against your own sleep hours, without treating the text as a diagnosis. Use it with a regular bedtime, not in place of care if trouble lasts."
    ),
  },
  "book-light-on-yoga": {
    about: t(
      "B.K.S. Iyengar: Asana-Referenz mit Tafeln und Hinweisen zur Reihenfolge. Taschenbuch, englische Ausgabe. Ein Praxisbuch zum Nachschlagen, kein Film und kein Kurszugang.",
      "B.K.S. Iyengar: an asana reference with plates and sequencing notes. Paperback, English edition. A practice book to look up, not a film and not a course login."
    ),
    make: t(
      "Taschenbuch mit fotografischen Tafeln, Herstellung beim Verlag. Die Haltungen stehen so im Band, wie Iyengar und der Verlag sie gesetzt haben.",
      "A paperback with photographic plates, made at the publisher. The poses sit in the volume as Iyengar and the publisher set them."
    ),
    use: t(
      "Haltung nachschlagen, Tafeln lesen, in der eigenen Stunde nur das nehmen, das du unterrichten oder üben kannst. Kein Ersatz für Korrektur durch eine Lehrperson, wenn du neu bist.",
      "Look up a pose, read the plates, take into your hour only what you can teach or hold. Not a substitute for a teacher’s correction if you are new."
    ),
  },
  "book-heart-of-yoga": {
    about: t(
      "T.K.V. Desikachar über das Anpassen der Praxis an den Menschen, mit Kommentar zu den Yoga-Sutras. Taschenbuch. Ein Text über Methode, kein reiner Bildatlas.",
      "T.K.V. Desikachar on adapting practice to the person, with Yoga Sutra commentary. Paperback. A text on method, not a picture atlas alone."
    ),
    make: t(
      "Englisches Taschenbuch, Satz und Druck vom Verlag. Sutra-Kommentar und Methodentext stehen im selben Band.",
      "An English paperback; type and print from the publisher. Sutra commentary and method text sit in the same volume."
    ),
    use: t(
      "Lesen, dann die eigene Stunde an den Menschen im Raum anpassen, nicht an ein fixes Programm. Den Sutra-Teil langsam, den Methodenteil als Arbeitsbuch.",
      "Read it, then fit the hour to the person in the room, not to a fixed programme. Take the Sutra part slowly; use the method part as a working book."
    ),
  },
  "book-wherever-you-go": {
    about: t(
      "Jon Kabat-Zinn zur Achtsamkeit im Alltag. Taschenbuch, englische Ausgabe. Kurze Kapitel zum Lesen und Ausprobieren, kein App-Abo.",
      "Jon Kabat-Zinn on everyday mindfulness. Paperback, English edition. Short chapters to read and try, not an app subscription."
    ),
    make: t(
      "Taschenbuch der englischen Ausgabe. Herstellung beim Verlag. Kein Audio-Code in diesem Artikel.",
      "English paperback. Made at the publisher. No audio code in this listing."
    ),
    use: t(
      "Ein Kapitel, dann eine Übung im Tag: Gehen, Sitzen, Essen. Nicht alle Kapitel an einem Abend. Zusammen mit Kissen oder Bank, wenn du sitzen willst.",
      "One chapter, then one try in the day: walking, sitting, eating. Not every chapter in one night. Use it with a cushion or bench if you want to sit."
    ),
  },
};

const FALLBACK: Record<string, Omit<ShopProductStory, "about">> = {
  yoga: {
    make: t(
      "Übliche Werkstoffe für diese Art von Artikel sind Naturkautschuk, Kork, Baumwolle, Bambus oder festes Holz. Platten werden geschnitten oder gepresst, Textilien gewebt und vernäht, Holz geschliffen. Genauere Stoffangaben stehen in Titel und Beschreibung dieses Stücks. ORIVE erfindet keine Fabrik und kein Siegel über das hinaus, was dort steht.",
      "Usual materials for this kind of item are natural rubber, cork, cotton, bamboo or hardwood. Sheets are cut or pressed, cloth is woven and sewn, wood is sanded. Finer material notes sit in this item’s title and description. ORIVE does not invent a factory or a mark beyond what is written there."
    ),
    use: t(
      "Auf der Matte oder als Stütze in der Haltung: unter Hände, Becken, Knie oder Brustkorb, je nach Form. Nach der Stunde trocken machen oder waschen, wie das Material es erlaubt. Nicht als Hebegurt oder Spielgerät, wenn der Artikel dafür nicht gebaut ist.",
      "On the mat or as a prop in the pose: under hands, pelvis, knees or ribcage, depending on the shape. After the hour, dry it or wash it as the material allows. Not a lifting sling or a toy if the piece is not built for that."
    ),
  },
  breathwork: {
    make: t(
      "Geräte und Hefte für die Atemarbeit entstehen aus Holz, Papier, Silikon, Edelstahl oder einfacher Elektronik. Intervalle, Widerstände oder Vorlagen sind fest im Gegenstand, nicht in einem Abo. Was hier fehlt, steht nicht still dazu.",
      "Tools and notebooks for breath work are made from wood, paper, silicone, stainless steel or simple electronics. Intervals, resistance or templates sit in the object, not in a subscription. What is missing here is not added in silence."
    ),
    use: t(
      "Protokoll wählen, Zeit stellen, atmen, danach notieren. Halte und hohe Widerstände nur, wenn du sie kennst. Bei Schwindel aufhören. Nicht im Wasser hyperventilieren.",
      "Pick a protocol, set a time, breathe, then write it down. Holds and high resistance only if you know them. Stop if you feel faint. Do not hyperventilate in water."
    ),
  },
  cold: {
    make: t(
      "Wannen und Fässer sind isolierte Behälter ohne still erfundene Kältemaschine. Textilien für danach sind Merino, Mikrofaser oder Neopren. Thermometer lesen nur die Temperatur. Aufbau und Ablauf folgen der Anleitung am Stück.",
      "Tubs and barrels are insulated vessels without a silently invented chiller. Textiles for after are merino, microfibre or neoprene. Thermometers only read temperature. Setup and drain follow the instructions on the piece."
    ),
    use: t(
      "Temperatur messen, kurz bleiben, steigern, danach trocken und warm. Nicht allein, wenn du unsicher bist. Bekannte Kreislaufthemen vorher klären. Nach Gebrauch leeren oder waschen, je nach Artikel.",
      "Measure the temperature, stay short, build up, then dry and warm. Do not go in alone if you are unsure. Clear known circulation issues first. Empty or wash after, depending on the item."
    ),
  },
  sound: {
    make: t(
      "Schalen, Gabeln, Zimbeln und Trommeln entstehen aus Quarz, Metalllegierung, Holz, Bambus oder Fell. Stimmung und Größe stehen in der Beschreibung, wenn sie gemessen sind. Handarbeit weicht von Stück zu Stück ab. Kein Verstärker im Lieferumfang, wenn er nicht genannt ist.",
      "Bowls, forks, cymbals and drums come from quartz, metal alloy, wood, bamboo or skin. Pitch and size sit in the description when they were measured. Handmade pieces vary. No amplifier is included unless it is named."
    ),
    use: t(
      "Anschlagen, anreiben oder kippen, Ton ausklingen lassen. Abstand zu Ohren und Glas. Trocken lagern, nicht fallen lassen. Für den Raum oder den eigenen Sitz, nicht als Dauerbeschallung.",
      "Strike, circle or tilt, let the tone decay. Distance from ears and glass. Store dry, do not drop. For the room or your own sit, not as a looped PA."
    ),
  },
  meditation: {
    make: t(
      "Kissen, Bänke und Kleingeräte für den Sitz sind Baumwolle, Buchweizen, Holz, Messing oder Stein. Bezüge sind oft abziehbar, Kerne nicht waschbar. Maße stehen in der Beschreibung, wenn sie gemessen sind.",
      "Cushions, benches and small tools for sitting are cotton, buckwheat, wood, brass or stone. Covers often come off; cores often do not go in the wash. Sizes sit in the description when they were measured."
    ),
    use: t(
      "Unterlage legen, Sitz einnehmen, Zeit halten, aufstehen. Bezug waschen, Kern lüften. Räucherware nur mit Schale und Aufsicht. Kein Ersatz für eine Lehrperson, wenn die Haltung schmerzt.",
      "Set a pad, take the seat, hold the time, stand. Wash the cover, air the core. Incense only with a dish and someone watching. Not a substitute for a teacher if the seat hurts."
    ),
  },
  bodywork: {
    make: t(
      "Rollen, Bälle, Steine und Bänke sind Schaum, Holz, Stein oder Stahl. Profile und Härten sind fest im Gegenstand. Keine still dazuerfundene Motorik oder Heizung, wenn sie nicht genannt ist.",
      "Rollers, balls, stones and benches are foam, wood, stone or steel. Profiles and hardness sit in the object. No silently added motor or heat unless it is named."
    ),
    use: t(
      "Druck dosieren, langsam bleiben, bei scharfem Schmerz stoppen. Nicht auf frische Verletzungen und nicht als Diagnose. Nach Gebrauch abwischen. Große Geräte nach Anleitung sichern.",
      "Dose the pressure, stay slow, stop if pain is sharp. Not on a fresh injury and not as a diagnosis. Wipe after. Secure large gear as instructed."
    ),
  },
  nutrition: {
    make: t(
      "Pasten, Pulver und Tees sind gemahlene oder gemischte Lebensmittel. Herkunft und Verarbeitung stehen nur dort, wo Titel oder Beschreibung sie nennen. Keine stillen Wirkversprechen und keine Apothekenzulage.",
      "Pastes, powders and teas are ground or blended foods. Origin and process sit only where the title or description names them. No silent effect claims and no pharmacy add-on."
    ),
    use: t(
      "Wie angegeben einrühren oder aufgießen. Dosis nicht still erhöhen. Allergien und Unsicherheit ernst nehmen. Trocken und lichtfern lagern, wenn das zum Gut passt.",
      "Stir or steep as stated. Do not raise the dose on your own. Take allergies and doubt seriously. Store dry and away from light when that fits the goods."
    ),
  },
  books: {
    make: t(
      "Taschenbuch der angegebenen Ausgabe. Satz, Druck und Einband kommen vom Verlag. ORIVE ändert den Text nicht und legt keinen Kurszugang bei, wenn er nicht genannt ist.",
      "A paperback of the stated edition. Type, print and binding come from the publisher. ORIVE does not change the text and includes no course login unless it is named."
    ),
    use: t(
      "Lesen, markieren, in der Praxis nur das nutzen, wofür du ausgebildet bist. Kein Ersatz für Ausbildung oder Abklärung. Papier, kein stiller Audio-Code.",
      "Read, mark, use in practice only what you are trained to hold. Not a substitute for training or care. Paper, no silent audio code."
    ),
  },
};

const DEFAULT_FALLBACK: Omit<ShopProductStory, "about"> = {
  make: t(
    "Herstellung und Materialien stehen in Titel und Beschreibung, soweit sie bekannt sind. ORIVE setzt keine Fabrik, kein Siegel und keine Lieferzeit dazu, die dort fehlen.",
    "How it is made and what it is made from sit in the title and description where they are known. ORIVE does not add a factory, a mark or a delivery time that is missing there."
  ),
  use: t(
    "Den Artikel so nutzen, wie Titel und Beschreibung es hergeben. Unklare Schritte weglassen. Pflege nach Material: trocken wischen, waschen oder lüften.",
    "Use the item as the title and description allow. Skip steps that are unclear. Care follows the material: wipe dry, wash or air."
  ),
};

function aboutFromProduct(product: ShopifyProduct): LangText {
  const title = product.node.title;
  const description = (product.node.description || "").replace(/\s+/g, " ").trim();
  return t(
    description
      ? `${title} steht mit diesen Angaben im Shop: ${description} Mehr als das, was hier und in den Blöcken darunter steht, erfinden wir nicht.`
      : `${title} ist der Artikel, den du geöffnet hast. Eine längere Beschreibung liegt für dieses Stück nicht vor. Herstellung und Anwendung folgen als allgemeine Hinweise zu dieser Warengruppe.`,
    description
      ? `${title} is listed with these facts: ${description} We do not invent more than what sits here and in the blocks below.`
      : `${title} is the item you opened. A longer description is not on file for this piece. Making and use follow as general notes for this kind of goods.`
  );
}

export function shopStoryOf(product: ShopifyProduct, isDe: boolean) {
  const entry = COPY[product.node.handle];
  const category = shopCategoryOf(product);
  const fallback = FALLBACK[category] || DEFAULT_FALLBACK;
  const story = entry || { about: aboutFromProduct(product), ...fallback };
  const lang = isDe ? "de" : "en";
  return {
    about: story.about[lang],
    make: story.make[lang],
    use: story.use[lang],
  };
}
