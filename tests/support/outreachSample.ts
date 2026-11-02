import type { OutreachData } from "@/emails/outreach";

/** Fictional sample (Anna Müller, Breathwork, Berlin); images are category covers labelled Beispielbild. */
export const SAMPLE: OutreachData = {
  vorname: "Anna", name: "Anna Müller", kategorie: "Breathwork", ort: "Berlin", offerCount: 3, accent: "#2fbf8f",
  coverUrl: "https://orive.co/claim/covers/breath.jpg",
  offers: [
    { title: "Breathwork Session", price: "25 €", imageUrl: "https://orive.co/claim/covers/breath.jpg", imageAlt: "Breathwork Session (Beispielbild)", imageLabel: "Beispielbild" },
    { title: "1:1 Breath Journey", price: null, imageUrl: "https://orive.co/claim/covers/meditation.jpg", imageAlt: "1:1 Breath Journey (Beispielbild)", imageLabel: "Beispielbild" },
    { title: "Kostenlose Atemübung", price: "Kostenlos", imageUrl: "https://orive.co/claim/covers/mindfulness.jpg", imageAlt: "Kostenlose Atemübung (Beispielbild)", imageLabel: "Beispielbild" },
  ],
  profilUrl: "https://orive.co/breathwork/anna-mueller", bestaetigenUrl: "https://orive.co/claim/TOKEN",
  ausblendenUrl: "https://orive.co/profil/ausblenden?token=OPT", loeschenUrl: "https://orive.co/profil/ausblenden?token=OPT&status=confirm",
};

