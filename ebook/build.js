const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, Footer,
  PageNumber, PageBreak, ShadingType, VerticalAlign, ImageRun,
  Tab, TabStopType, LeaderType
} = require("docx");
const fs = require("fs");
const path = require("path");
const oils = require("./oils");

// ---------- Palette ----------
const GREEN_DARK = "3A5A40";
const GREEN_MID = "588157";
const ACCENT = "A3B18A";
const TEXT_GRAY = "3A3A3A";
const WARN = "8C2F2F";

const IMG_DIR = path.join(__dirname, "img");
const IMG_W = 600;
const IMG_H = 256;

// ---------- Bausteine ----------
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const h1 = (text, brk) =>
  new Paragraph({
    text, heading: HeadingLevel.HEADING_1,
    spacing: { after: 150 },
    pageBreakBefore: !!brk,
    keepNext: true, keepLines: true,
  });

const h2 = (text, brk) =>
  new Paragraph({
    text, heading: HeadingLevel.HEADING_2,
    spacing: { before: brk ? 0 : 180, after: 80 },
    pageBreakBefore: !!brk,
    keepNext: true, keepLines: true,
  });

const h3 = (text) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, color: GREEN_MID, size: 23 })],
    spacing: { before: 110, after: 60 },
    keepNext: true, keepLines: true,
  });

const p = (text, opts = {}) => {
  const { keepNext, ...run } = opts;
  return new Paragraph({
    children: [new TextRun({ text, ...run })],
    spacing: { after: 100, line: 268 },
    keepLines: true,
    keepNext: !!keepNext,
  });
};

const meta = (text) =>
  new Paragraph({
    children: [new TextRun({ text, italics: true, color: "6B6B6B", size: 19 })],
    spacing: { after: 90 },
  });

const bullet = (lead, text) =>
  new Paragraph({
    children: [new TextRun({ text: lead + ": ", bold: true }), new TextRun({ text })],
    bullet: { level: 0 },
    spacing: { after: 55, line: 268 },
    keepLines: true,
  });

const plainBullet = (text) =>
  new Paragraph({
    children: [new TextRun({ text })],
    bullet: { level: 0 },
    spacing: { after: 55, line: 268 },
    keepLines: true,
  });

const note = (text) =>
  new Paragraph({
    children: [
      new TextRun({ text: "Sicherheit: ", bold: true, italics: true, color: WARN, size: 19 }),
      new TextRun({ text, italics: true, color: WARN, size: 19 }),
    ],
    spacing: { before: 50, after: 120, line: 250 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: WARN, space: 8 } },
    indent: { left: 120 },
  });

const rule = () =>
  new Paragraph({
    text: "",
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
    spacing: { after: 220 },
  });

const image = (key) => {
  const jpg = path.join(__dirname, "img_jpg", key + ".jpg");
  const png = path.join(IMG_DIR, key + ".png");
  const file = fs.existsSync(jpg) ? jpg : png;
  if (!fs.existsSync(file)) return p("");
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 130 },
    children: [
      new ImageRun({
        data: fs.readFileSync(file),
        transformation: { width: IMG_W, height: IMG_H },
        type: file.endsWith(".jpg") ? "jpg" : "png",
      }),
    ],
  });
};

// Tabelle mit Kopfzeile
function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (text, w, opts = {}) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: opts.head ? { type: ShadingType.CLEAR, fill: GREEN_DARK } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 55, bottom: 55, left: 100, right: 100 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: !!opts.head,
              color: opts.head ? "FFFFFF" : TEXT_GRAY,
              size: 20,
            }),
          ],
        }),
      ],
    });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) => cell(h, widths[i], { head: true })),
      }),
      ...rows.map(
        (r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i])) })
      ),
    ],
  });
}

// ================= Inhalte =================

const wirkstoffe = [
  ["Monoterpene", "Zitrone, Kiefer, Wacholder", "frisch, klärend, luftreinigend"],
  ["Ester", "Lavendel, Römische Kamille, Muskatellersalbei", "entspannend, ausgleichend, mild"],
  ["Alkohole", "Teebaum, Geranie, Rose", "stärkend, gut hautverträglich"],
  ["Oxide", "Eukalyptus, Rosmarin", "atemwegsklärend, anregend"],
  ["Aldehyde", "Zitronengras, Melisse", "beruhigend, aber hautreizend"],
  ["Phenole", "Nelke, Thymian (Thymol)", "sehr kraftvoll, stark reizend"],
  ["Sesquiterpene", "Sandelholz, Patchouli, Vetiver", "erdend, entzündungsberuhigend"],
  ["Ketone", "Rosmarin (Campher), Fenchel", "schleimlösend, mit Vorsicht"],
];

const rezepte = [
  ["Guter-Schlaf-Diffusor", "3 Tr. Lavendel · 2 Tr. Römische Kamille · 1 Tr. Bergamotte", "30 Minuten vor dem Schlafengehen im Diffusor verströmen."],
  ["Tiefschlaf-Roller", "3 Tr. Vetiver · 4 Tr. Lavendel · 2 Tr. Sandelholz auf 10 ml Olivenöl", "Abends auf Handgelenke und Fußsohlen auftragen."],
  ["Stress-loslassen-Roller", "4 Tr. Bergamotte · 3 Tr. Lavendel · 2 Tr. Ylang-Ylang auf 10 ml Olivenöl", "Bei Anspannung auf Handgelenke und Nacken auftragen."],
  ["Erkältungs-Dampfbad", "2 Tr. Eukalyptus · 1 Tr. Thymian (Linalool) · 1 Tr. Kiefer", "In heißes Wasser geben, Kopf mit Handtuch bedecken, 5–10 Min. inhalieren. Nur Erwachsene."],
  ["Brustbalsam für die kalte Zeit", "3 Tr. Kiefer · 2 Tr. Eukalyptus · 1 Tr. Thymian auf 30 ml Olivenöl", "Sanft auf Brust und oberen Rücken einmassieren."],
  ["Konzentrations-Diffusor", "2 Tr. Rosmarin · 2 Tr. Zitrone · 1 Tr. Pfefferminze", "Während Arbeits- oder Lernphasen verströmen."],
  ["Muskel-Massageöl", "3 Tr. Wacholder · 3 Tr. Rosmarin · 2 Tr. Ingwer auf 30 ml Olivenöl", "Nach dem Training kräftig einmassieren."],
  ["Bauchwohl-Öl", "3 Tr. Fenchel · 2 Tr. Pfefferminze · 1 Tr. Römische Kamille auf 30 ml Olivenöl", "Im Uhrzeigersinn auf den Bauch einmassieren."],
  ["Frauenwohl-Öl", "3 Tr. Muskatellersalbei · 2 Tr. Geranie · 2 Tr. Lavendel auf 30 ml Olivenöl", "Warm auf den Unterbauch auftragen."],
  ["Haarkur für die Kopfhaut", "4 Tr. Zedernholz · 3 Tr. Rosmarin auf 2 EL Olivenöl", "In die Kopfhaut einmassieren, 30 Min. einwirken, auswaschen."],
  ["Gesichtsöl für reife Haut", "2 Tr. Weihrauch · 1 Tr. Rose · 1 Tr. Sandelholz auf 30 ml Olivenöl", "Abends auf die gereinigte Haut auftragen."],
  ["Stimmungsaufheller", "3 Tr. Orange · 2 Tr. Bergamotte · 1 Tr. Jasmin", "An trüben Tagen im Diffusor verströmen."],
  ["Natürliches Insektenspray", "15 Tr. Zitronengras · 10 Tr. Geranie · 5 Tr. Zedernholz auf 100 ml Wasser + Emulgator", "Vor dem Aufenthalt im Freien auf Kleidung sprühen."],
  ["Reinigungsspray", "15 Tr. Zitrone · 10 Tr. Teebaum auf 500 ml Wasser + Schuss Essig", "Als natürlichen Allzweckreiniger verwenden."],
  ["Winter-Wohlfühlduft", "3 Tr. Orange · 1 Tr. Zimt · 1 Tr. Nelke", "Für gemütliche Winterabende im Diffusor."],
  ["Erkältungsbad", "3 Tr. Kiefer · 2 Tr. Eukalyptus · 1 Tr. Thymian, mit 2 EL Sahne emulgiert", "Ins warme Badewasser geben, höchstens 15 Minuten baden. Nicht bei Fieber."],
  ["Wundrand-Pflegeöl", "2 Tr. Lavendel · 1 Tr. Myrrhe · 1 Tr. Weihrauch auf 30 ml Olivenöl", "Nach dem Reinigen vorsichtig auf den Rand kleiner, oberflächlicher Wunden auftragen."],
  ["Kopfschmerz-Roller", "3 Tr. Pfefferminze · 3 Tr. Lavendel auf 10 ml Olivenöl", "Auf Schläfen und Nacken auftragen, Augenpartie aussparen."],
  ["Gelenk-Einreibung", "3 Tr. Weihrauch · 2 Tr. Ingwer · 2 Tr. Wacholder auf 30 ml Olivenöl", "Zweimal täglich sanft einmassieren."],
  ["Reise-Roller gegen Übelkeit", "3 Tr. Ingwer · 2 Tr. Pfefferminze auf 10 ml Olivenöl", "Vor Fahrtbeginn auf die Handgelenke auftragen und daran riechen."],
  ["Mund- und Zahnfleischöl", "1 Tr. Myrrhe · 1 Tr. Nelke auf 2 EL Olivenöl", "Punktuell mit dem Finger einmassieren, gut ausspucken, nicht schlucken."],
];

const gesundheit = [
  ["Atemwege und Erkältungszeit",
   "Eukalyptus, Kiefer, Thymian, Teebaum",
   "Die Öle mit hohem Cineol- und Pinen-Anteil sind die traditionellen Begleiter der kalten Jahreszeit. Bewährt haben sich drei Wege: das Dampfbad für Erwachsene, die Brusteinreibung mit Olivenöl und der Diffusor im Wohnraum. Für Kinder gilt besondere Zurückhaltung – Eukalyptus und Pfefferminze sind unter sechs Jahren tabu, hier ist Thymian vom Chemotyp Linalool die mildere Wahl."],
  ["Kleine Wunden, Schürfungen und Insektenstiche",
   "Lavendel, Teebaum, Myrrhe, Weihrauch, Römische Kamille",
   "Bei kleinen, oberflächlichen Verletzungen gilt eine feste Reihenfolge: zuerst die Wunde mit klarem Wasser reinigen, dann trocknen lassen. Ätherische Öle kommen erst danach zum Einsatz – verdünnt in Olivenöl und nur auf den Wundrand, niemals in die offene Wunde. Lavendel ist hier das traditionsreichste Öl, Myrrhe wird bei rissiger und schlecht heilender Haut geschätzt, Weihrauch bei bereits verschlossenen Narben. Bei Insektenstichen hat sich ein Tropfen Lavendel oder Teebaum, verdünnt aufgetupft, bewährt. Wichtig: Tiefe, stark blutende oder verschmutzte Wunden, Bisswunden sowie alles mit Anzeichen einer Entzündung – Rötung, Schwellung, Überwärmung, Eiter, Fieber – gehören umgehend in ärztliche Behandlung."],
  ["Kopfschmerzen und Verspannungen",
   "Pfefferminze, Lavendel, Rosmarin, Kiefer",
   "Der Klassiker bei Kopfschmerzen vom Verspannungstyp ist Pfefferminze: ein Tropfen, in Olivenöl verdünnt, auf Schläfen und Nacken eingerieben – die Augenpartie bleibt dabei ausgespart. Wer den kühlen Menthol-Reiz nicht mag, greift zu Lavendel. Sitzt die Ursache in Schulter und Nacken, sind Rosmarin und Kiefer als kräftige Einreibung die bessere Wahl. Bei plötzlich einsetzenden, ungewohnt heftigen oder häufig wiederkehrenden Kopfschmerzen ist eine ärztliche Abklärung angezeigt."],
  ["Übelkeit und Beschwerden unterwegs",
   "Ingwer, Pfefferminze, Zitrone",
   "Ingwer ist das bekannteste Öl bei Reiseübelkeit und wirkt am schnellsten über die Nase: ein Tropfen auf ein Taschentuch, schon vor Fahrtbeginn. Pfefferminze und Zitrone sind die milderen Alternativen und werden auch bei morgendlicher Übelkeit geschätzt. In der Schwangerschaft gilt für alle drei: vorher mit Hebamme oder Arzt sprechen."],
  ["Haut und Hautpflege",
   "Lavendel, Teebaum, Weihrauch, Rose, Patchouli, Myrrhe",
   "Ätherische Öle gehören in der Hautpflege immer verdünnt aufgetragen – Olivenöl ist dafür ein hervorragender Träger. Bei unreiner Haut hat Teebaum die längste Tradition, bei reifer Haut Weihrauch und Rose, bei rissiger und strapazierter Haut Patchouli und Myrrhe. Für das Gesicht gilt eine besonders niedrige Verdünnung von 0,5 bis 1 Prozent."],
  ["Schlaf und nervöse Unruhe",
   "Lavendel, Vetiver, Römische Kamille, Melisse, Sandelholz",
   "Kaum ein Bereich ist in der Aromatherapie so gut belegt wie der Schlaf. Entscheidend ist die Regelmäßigkeit: Ein gleichbleibendes Duftritual etwa 30 Minuten vor dem Zubettgehen wirkt über die Zeit stärker als eine einmalige hohe Dosis. Bei hartnäckigem Gedankenkreisen greifen viele auf Vetiver zurück, das als das erdendste aller Öle gilt."],
  ["Stress und emotionale Balance",
   "Bergamotte, Ylang-Ylang, Jasmin, Rose, Geranie",
   "Der Weg über die Nase ist hier der direkteste: Duftmoleküle erreichen das limbische System, noch bevor der Verstand sie einordnet. Bergamotte nimmt eine Sonderstellung ein, weil sie gleichzeitig aufhellt und beruhigt. Bei Trauer und emotionaler Erschöpfung hat Rose die längste Tradition."],
  ["Muskeln, Gelenke und Bewegung",
   "Rosmarin, Wacholder, Ingwer, Kiefer, Zitronengras",
   "Vor dem Sport wärmen Ingwer und Rosmarin die Muskulatur, danach helfen Wacholder und Zitronengras bei Muskelkater. Immer großzügig mit Olivenöl verdünnen und in Richtung Herz ausstreichen. Bei akuten Verletzungen, Schwellungen oder Entzündungen gehört die Behandlung in ärztliche Hände."],
  ["Verdauung und Bauchgefühl",
   "Fenchel, Pfefferminze, Ingwer, Römische Kamille",
   "Die sanfte Bauchmassage im Uhrzeigersinn – der Richtung des Dickdarms folgend – ist die klassische Anwendung. Fenchel ist hier das traditionsreichste Öl, Pfefferminze das kühlendste. Bei anhaltenden Beschwerden, Blut im Stuhl oder unklarem Gewichtsverlust ist immer eine ärztliche Abklärung nötig."],
  ["Frauengesundheit",
   "Muskatellersalbei, Geranie, Rose, Fenchel",
   "Muskatellersalbei und Fenchel enthalten Moleküle mit östrogenähnlicher Struktur und werden traditionell bei Zyklusbeschwerden und in den Wechseljahren eingesetzt. Genau deshalb sind sie in der Schwangerschaft und bei hormonabhängigen Erkrankungen zu meiden. Eine warme Auflage auf den Unterbauch verstärkt die Anwendung."],
  ["Mund- und Zahnpflege",
   "Myrrhe, Nelke, Teebaum",
   "Myrrhe hat als Tinktur eine jahrhundertealte Tradition bei gereiztem Zahnfleisch, Nelkenöl bei Zahnbeschwerden. Beide sind stark und werden nur punktuell und gut verdünnt eingesetzt, niemals geschluckt. Diese Anwendungen überbrücken höchstens die Zeit bis zum Zahnarzttermin – sie ersetzen ihn nicht."],
  ["Konzentration und geistige Frische",
   "Rosmarin, Pfefferminze, Zitrone, Grapefruit",
   "Rosmarin gilt seit der Antike als Kraut der Erinnerung. In Kombination mit Zitrone entsteht eine der beliebtesten Mischungen für Arbeitszimmer und Lernphasen. Wichtig: Der Diffusor sollte nicht dauerhaft laufen – 30 bis 45 Minuten genügen, danach tritt ein Gewöhnungseffekt ein."],
  ["Kopfhaut und Haare",
   "Zedernholz, Rosmarin, Ylang-Ylang",
   "Zedernholz und Rosmarin sind die beiden traditionsreichsten Öle für die Kopfhautpflege. Als Ölkur mit Olivenöl vor der Haarwäsche angewendet, hat sich eine Einwirkzeit von etwa 30 Minuten bewährt. Ylang-Ylang ergänzt die Pflege bei trockenen, spröden Längen."],
];

const faq = [
  ["Kann ich ätherische Öle einnehmen?", "Von der innerlichen Einnahme wird in diesem Buch bewusst abgeraten. Hochkonzentrierte Öle reizen die Schleimhäute und können mit Medikamenten wechselwirken. Eine Einnahme sollte ausschließlich unter fachkundiger Begleitung durch Arzt oder erfahrenen Aromatherapeuten erfolgen."],
  ["Warum wird hier Olivenöl als Trägeröl empfohlen?", "Olivenöl ist in jedem Haushalt vorhanden, preiswert, sehr hautfreundlich und dank seines Vitamin-E-Gehalts lange haltbar. Es zieht etwas langsamer ein als Mandel- oder Jojobaöl und hat einen leichten Eigengeruch – für die allermeisten Anwendungen ist das aber vollkommen unerheblich."],
  ["Sind ätherische Öle für Katzen gefährlich?", "Ja. Katzen fehlt ein Leberenzym zum Abbau bestimmter Inhaltsstoffe. Besonders kritisch sind Teebaum, Zitrusöle und Pfefferminze. Diffusoren nur in gut belüfteten Räumen betreiben, aus denen das Tier jederzeit ausweichen kann."],
  ["Wie erkenne ich ein hochwertiges Öl?", "Achten Sie auf den botanischen Namen, die Angabe 100 % naturrein, Herkunftsland, Chargennummer und möglichst eine GC/MS-Analyse. Dunkles Glas ist Pflicht. Wenn alle Öle einer Serie gleich viel kosten, ist das ein Warnsignal – echte Rose kann nicht so viel kosten wie Orange."],
  ["Wie lange sollte der Diffusor laufen?", "30 bis 60 Minuten genügen. Dauerbetrieb wird nicht empfohlen: Er führt zu Gewöhnung, kann Kopfschmerzen auslösen und verbraucht unnötig Öl."],
  ["Darf ich ätherische Öle in der Schwangerschaft nutzen?", "Manche gelten in Maßen als unbedenklich, andere sind zu meiden – darunter Muskatellersalbei, Rosmarin, Wacholder, Fenchel, Zimt, Nelke, Thymian und Myrrhe. Sprechen Sie vorher immer mit Hebamme oder Arzt."],
  ["Was tue ich bei einer Hautreaktion?", "Die Stelle sofort mit reichlich Olivenöl abtupfen, nicht mit Wasser – ätherische Öle lösen sich nicht in Wasser, sondern in Fett. Danach mild reinigen. Bei starken oder anhaltenden Reaktionen zum Arzt."],
  ["Diffusor oder Duftlampe?", "Ultraschall-Diffusoren verteilen die Öle schonend über feinen Nebel. Duftlampen mit Teelicht erhitzen das Öl stärker, was die Molekülstruktur verändern kann. Diffusoren sind die schonendere Variante."],
  ["Wie lange sind die Öle haltbar?", "Zitrusöle 1–2 Jahre, Kräuter- und Nadelöle 2–3 Jahre. Harz- und Holzöle wie Weihrauch, Sandelholz, Patchouli und Vetiver gewinnen mit den Jahren sogar an Tiefe. Notieren Sie das Öffnungsdatum auf dem Fläschchen."],
  ["Kann ich mehrere Öle mischen?", "Ja, das ist sogar erwünscht – Mischungen wirken oft runder als Einzelöle. Als Faustregel gilt: nicht mehr als drei bis vier Öle, und die Gesamtmenge an Tropfen nicht erhöhen. Kombinieren Sie eine Kopfnote (Zitrus), eine Herznote (Blüten, Kräuter) und eine Basisnote (Hölzer, Harze)."],
];

// ================= Dokument =================

let children = [];

// --- Titelseite ---
children.push(
  new Paragraph({ text: "", spacing: { before: 2400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "DIE HEILENDE KRAFT DER", bold: true, size: 30, color: GREEN_MID, font: "Cambria" })],
    spacing: { after: 100 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ÄTHERISCHEN ÖLE", bold: true, size: 62, color: GREEN_DARK, font: "Cambria" })],
    spacing: { after: 520 },
  }),
  image("lavendel"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 14 } },
    children: [],
    spacing: { before: 420, after: 300 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Das große Praxisbuch der Aromatherapie", italics: true, size: 28, color: GREEN_MID })],
  }),
  pageBreak()
);

// --- Inhaltsverzeichnis ---
// Seitenzahlen stammen aus dem gesetzten Dokument (siehe toc_pages.json).
const toc = [
  ["Die 30 Öle im Überblick", 3],
  ["Einleitung", 4],
  ["Wie ätherische Öle auf Körper und Psyche wirken", 5],
  ["Die Wirkstoffgruppen und ihre Eigenschaften", 6],
  ["Die wichtigsten Anwendungsformen", 6],
  ["Richtig verdünnen mit Olivenöl", 7],
  ["Sicherheit im Umgang mit ätherischen Ölen", 7],
  ["Die 30 Öle im Porträt", 8],
  ["Gesundheit im Fokus – Öle nach Themen", 39],
  ["Rezepturen und Synergien", 41],
  ["Ätherische Öle im Tagesablauf", 43],
  ["Qualität, Kauf und Lagerung", 43],
  ["Häufig gestellte Fragen", 44],
  ["Fazit und rechtlicher Hinweis", 45],
  ["Anwendungsverzeichnis von A bis Z", 46],
];

children.push(
  h1("Inhaltsverzeichnis"),
  ...toc.map(([titel, seite]) =>
    new Paragraph({
      children: [
        new TextRun({ text: titel, size: 26 }),
        new TextRun({ children: [new Tab()] }),
        new TextRun({ text: String(seite), size: 26, bold: true, color: GREEN_MID }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9746, leader: LeaderType.DOT }],
      spacing: { after: 460, line: 300 },
    })
  ),
  new Paragraph({ text: "", spacing: { after: 200 } })
);

// --- Öl-Verzeichnis ---
children.push(h1("Die 30 Öle im Überblick", true));
children.push(p("Alle Öle dieses Buches auf einen Blick, geordnet nach der Nummer ihres Porträts im Hauptteil.", { size: 21 }));

{
  const kurz = (g) => ({ "Bäume & Harze": "Hölzer", "Wurzeln & Gewürze": "Gewürze" }[g] || g);
  const gruppenFarbe = {
    "Blüten": "EADCEB", "Kräuter": "DCE8D2", "Zitrus": "F7EBC8",
    "Hölzer": "E5DAC8", "Gewürze": "F0DCCC",
  };
  const widths = [620, 2020, 1700, 1180, 2520];
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (text, w, opts = {}) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 34, bottom: 34, left: 60, right: 60 },
      children: [new Paragraph({
        spacing: { after: 0, line: 200 },
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({
          text,
          bold: !!opts.bold,
          italics: !!opts.italics,
          color: opts.color || TEXT_GRAY,
          size: opts.size || 17,
        })],
      })],
    });

  const rows = [
    new TableRow({
      tableHeader: true, cantSplit: true,
      children: ["Nr", "Öl", "Botanischer Name", "Gruppe", "Schwerpunkt"].map((h, i) =>
        cell(h, widths[i], {
          bold: true, color: "FFFFFF", fill: GREEN_DARK, size: 20,
          center: i === 0 || i === 3,
        })),
    }),
    ...[...oils].sort((a, b) => a.nr - b.nr).map((o, i) => {
      const zebra = i % 2 ? undefined : "F4F7F0";
      const g = kurz(o.gruppe);
      return new TableRow({
        cantSplit: true,
        children: [
          cell(String(o.nr), widths[0], { fill: zebra, center: true, color: "7A8A72" }),
          cell(o.name, widths[1], { bold: true, fill: zebra }),
          cell(o.latin, widths[2], { italics: true, fill: zebra, color: "5F6F5C" }),
          cell(g, widths[3], { fill: gruppenFarbe[g], center: true, size: 18 }),
          cell(o.schwerpunkt, widths[4], { fill: zebra, size: 18 }),
        ],
      });
    }),
  ];
  children.push(new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows }));
}

// --- Einleitung ---
children.push(
  h1("Einleitung", true),
  h2("Was sind ätherische Öle?"),
  p("Ätherische Öle sind hochkonzentrierte, duftende Pflanzenauszüge, gewonnen aus Blüten, Blättern, Schalen, Wurzeln, Hölzern oder Harzen – meist durch Wasserdampfdestillation, bei Zitrusfrüchten durch Kaltpressung. In einem einzigen Tropfen steckt oft die Essenz von Hunderten Pflanzenteilen. Für einen Milliliter Rosenöl werden rund 4.000 Blüten benötigt. Das erklärt zweierlei: warum diese Öle so intensiv wirken, und warum sie sparsam dosiert gehören."),
  p("Botanisch betrachtet sind ätherische Öle keine Fette, sondern flüchtige Substanzgemische aus oft mehr als hundert Einzelverbindungen. Für die Pflanze erfüllen sie lebenswichtige Aufgaben: Sie locken Bestäuber an, halten Fressfeinde fern und schützen vor Pilzen und Bakterien. Genau diese Eigenschaften macht sich die Aromatherapie zunutze."),
  h2("Eine kurze Geschichte"),
  p("Der Umgang mit duftenden Pflanzenessenzen reicht Jahrtausende zurück. Im alten Ägypten dienten Öle für Rituale, Kosmetik und Einbalsamierung – Weihrauch und Myrrhe waren wertvoller als Gold. In Griechenland und Rom gehörten aromatische Bäder und Massagen zum Alltag. Die Klostermedizin des Mittelalters bewahrte und erweiterte dieses Wissen, Hildegard von Bingen beschrieb zahlreiche Heilpflanzen, die heute noch verwendet werden."),
  p("Den Begriff Aromatherapie prägte erst im 20. Jahrhundert der französische Chemiker René-Maurice Gattefossé. Der Legende nach kühlte er eine Verbrennung mit Lavendelöl und war von der Heilung so beeindruckt, dass er sein Leben der Erforschung ätherischer Öle widmete. Seither hat sich die Aromatherapie als eigenständiger Bereich der Naturheilkunde etabliert – in Frankreich sogar als medizinische Fachrichtung.")
);

children.push(
  h1("Wie ätherische Öle auf Körper und Psyche wirken", true),
  h2("Der Weg über die Nase"),
  p("Duftmoleküle gelangen beim Einatmen an die Riechschleimhaut im oberen Nasenraum. Dort sitzen rund 350 verschiedene Riechrezeptortypen, die das Signal direkt an den Riechkolben und von dort ins limbische System weiterleiten – jenen entwicklungsgeschichtlich alten Teil des Gehirns, der Emotionen, Erinnerungen und das vegetative Nervensystem steuert."),
  p("Das Besondere daran: Der Geruchssinn ist der einzige Sinn, dessen Signale nicht zuerst über den Thalamus, die Schaltzentrale des Bewusstseins, laufen. Ein Duft erreicht das Gefühlszentrum also, bevor der Verstand ihn eingeordnet hat. Genau deshalb kann ein Geruch schlagartig eine Kindheitserinnerung wachrufen – und deshalb wirken ätherische Öle so unmittelbar auf die Stimmung."),
  h2("Der Weg über die Haut"),
  p("Ätherische Öle bestehen aus sehr kleinen, fettlöslichen Molekülen. Verdünnt in einem Trägeröl aufgetragen, überwinden sie die oberste Hautschicht und gelangen in tiefere Gewebeschichten. Deshalb ist die Wahl des Trägeröls wichtig – in diesem Buch wird durchgehend Olivenöl empfohlen. Massage verbindet dabei zwei Wirkwege: den Duft über die Nase und die Hautaufnahme, ergänzt um die Berührung selbst."),
  h2("Der Weg über die Atemwege"),
  p("Beim Inhalieren erreichen Duftmoleküle die Schleimhäute von Nase, Rachen und Bronchien. Öle mit hohem Cineol-Anteil wie Eukalyptus und Rosmarin werden hier traditionell zur Unterstützung freier Atmung eingesetzt. Der warme Wasserdampf beim Dampfbad befeuchtet zusätzlich die Schleimhäute."),
  h2("Was Aromatherapie leisten kann – und was nicht"),
  p("Aromatherapie versteht sich als begleitende Praxis für Wohlbefinden und Lebensqualität. Sie kann Entspannung fördern, Rituale schaffen, die Hautpflege bereichern und in der Erkältungszeit unterstützen. Sie ersetzt keine ärztliche Diagnose und keine notwendige Behandlung. Bei anhaltenden Beschwerden, unklaren Symptomen oder chronischen Erkrankungen gehört die Abklärung in fachkundige Hände – ätherische Öle können dann begleitend zum Einsatz kommen, nicht anstelle.", { italics: true })
);

children.push(
  h1("Die Wirkstoffgruppen und ihre Eigenschaften", true),
  p("Ätherische Öle lassen sich nach ihren chemischen Hauptbestandteilen ordnen. Wer diese Gruppen kennt, kann die Eigenschaften eines unbekannten Öls oft schon erahnen – und erkennt, wo Vorsicht geboten ist."),
  table(
    ["Gruppe", "Typische Öle", "Charakter in der Aromapraxis"],
    wirkstoffe,
    [1900, 3300, 3786]
  ),
  new Paragraph({ text: "", spacing: { after: 220 } }),
  p("Als Faustregel gilt: Ester und Sesquiterpene sind die sanftesten Gruppen und eignen sich für empfindliche Haut, Kinder und ältere Menschen. Phenole und Aldehyde sind die kraftvollsten, verlangen aber niedrige Dosierung und sorgfältige Verdünnung. Ketone sollten in Schwangerschaft und bei Epilepsie gemieden werden.")
);

children.push(
  h1("Die wichtigsten Anwendungsformen"),
  bullet("Diffusor", "Ultraschall verteilt das Öl über feinen Nebel im Raum. Die schonendste Form. 3–5 Tropfen auf eine Füllung, 30–45 Minuten Laufzeit."),
  bullet("Inhalation", "Ein Tropfen auf ein Taschentuch oder in die Handflächen, dann bewusst tief einatmen. Wirkt am schnellsten, ideal für unterwegs."),
  bullet("Dampfbad", "1–2 Tropfen in eine Schüssel heißes Wasser, Kopf mit Handtuch bedecken, Augen geschlossen halten. Nur für Erwachsene."),
  bullet("Massage und Hautauftrag", "Verdünnt in Olivenöl. Verbindet Duftwirkung, Hautaufnahme und Berührung."),
  bullet("Vollbad", "2–4 Tropfen mit einem Emulgator wie Sahne, Honig oder Salz vermischen. Ohne Emulgator schwimmt das Öl unverdünnt auf und kann die Haut reizen."),
  bullet("Kompresse", "Einige Tropfen in warmes oder kaltes Wasser, ein Tuch tränken und auflegen. Bewährt bei Bauch und Nacken."),
  bullet("Fußbad", "2–4 Tropfen in warmes Wasser. Die Fußsohlen nehmen besonders gut auf."),
  bullet("Roll-on", "Öle in einer Rollerflasche mit Olivenöl verdünnt. Praktisch für die Handtasche."),
  bullet("Raumspray", "Öl mit Wasser und Emulgator in einer Sprühflasche, vor Gebrauch schütteln."),
  bullet("Haushaltsreiniger", "Zitrone und Teebaum als natürliche Ergänzung in Putzmitteln.")
);

children.push(
  h1("Richtig verdünnen mit Olivenöl", true),
  h2("Warum Olivenöl?"),
  p("Ätherische Öle gehören fast nie unverdünnt auf die Haut. Sie brauchen ein fettes Trägeröl, das sie aufnimmt, ihre Konzentration senkt und selbst die Haut pflegt. In diesem Buch wird durchgehend Olivenöl empfohlen – aus vier Gründen:"),
  plainBullet("Es steht in praktisch jedem Haushalt bereits im Regal, ohne Zusatzkauf."),
  plainBullet("Es ist sehr hautfreundlich und reich an Ölsäure, die die Hautbarriere unterstützt."),
  plainBullet("Sein natürlicher Vitamin-E-Gehalt macht es lange haltbar – es wird nicht so schnell ranzig wie viele andere Pflanzenöle."),
  plainBullet("Es ist preiswert und in geprüfter Qualität überall erhältlich."),
  p("Verwenden Sie am besten ein natives Olivenöl extra. Zwei Eigenschaften sollten Sie kennen: Es zieht etwas langsamer ein als Mandel- oder Jojobaöl und hat einen leichten Eigengeruch. Für Massage, Körperpflege und die meisten Anwendungen spielt das keine Rolle. Wenn Sie ein Gesichtsöl für sehr fettige Haut mischen oder ein völlig geruchsneutrales Ergebnis brauchen, ist Jojobaöl die Alternative."),
  h2("Die Verdünnungstabelle"),
  table(
    ["Anwendungsbereich", "Verdünnung", "Praktisch gerechnet"],
    [
      ["Gesicht (Erwachsene)", "0,5–1 %", "1 Tr. auf 1 EL Olivenöl"],
      ["Körper und Massage", "2–3 %", "6 Tr. auf 1 EL Olivenöl"],
      ["Punktuelle Anwendung", "5–10 %", "2 Tr. auf 1 TL Olivenöl"],
      ["Kinder 6–12 Jahre", "1 %", "1 Tr. auf 1 EL Olivenöl"],
      ["Kinder 3–6 Jahre", "0,5 %", "1 Tr. auf 2 EL Olivenöl"],
      ["Senioren, empfindliche Haut", "1 %", "1 Tr. auf 1 EL Olivenöl"],
      ["Vollbad", "2–4 Tr.", "mit Sahne oder Honig emulgieren"],
      ["Diffusor (Raum ca. 20 m²)", "3–5 Tr.", "auf eine Wasserfüllung"],
    ],
    [3100, 2000, 3886]
  ),
  new Paragraph({ text: "", spacing: { after: 200 } }),
  meta("Ein Esslöffel entspricht etwa 15 ml, ein Teelöffel etwa 5 ml. Ein Tropfen aus dem Standard-Tropfeinsatz entspricht etwa 0,03–0,05 ml.")
);

children.push(
  h1("Sicherheit im Umgang mit ätherischen Ölen"),
  h2("Grundregeln"),
  plainBullet("Vor der ersten Anwendung eines neuen Öls einen Patch-Test durchführen: verdünnt in die Armbeuge auftragen und 24 Stunden abwarten."),
  plainBullet("Nie unverdünnt großflächig auf die Haut auftragen."),
  plainBullet("Von Augen, Ohren und Schleimhäuten fernhalten. Bei Augenkontakt mit Olivenöl ausspülen, nicht mit Wasser."),
  plainBullet("Niemals in offene, tiefe oder stark blutende Wunden geben. Ätherische Öle gehören nur verdünnt auf den Rand oberflächlicher oder bereits geschlossener Verletzungen."),
  plainBullet("Niemals in offene, tiefe oder stark blutende Wunden geben – ätherische Öle gehören nur verdünnt auf den Wundrand geschlossener oder oberflächlicher Verletzungen."),
  plainBullet("Zitrusöle sind phototoxisch – nach Hautkontakt mindestens 12 Stunden Sonne und Solarium meiden."),
  plainBullet("Dunkel, kühl und außerhalb der Reichweite von Kindern lagern. Öle sind keine Spielzeuge und keine Getränke."),
  plainBullet("Bei Medikamenteneinnahme auf Wechselwirkungen achten – Grapefruit ist hier besonders relevant."),
  h2("Besondere Personengruppen"),
  bullet("Schwangerschaft und Stillzeit", "Zu meiden sind unter anderem Muskatellersalbei, Rosmarin, Wacholder, Fenchel, Zimt, Nelke, Thymian, Zedernholz und Myrrhe. Vor jeder Anwendung mit Hebamme oder Arzt sprechen."),
  bullet("Säuglinge und Kleinkinder", "Unter 3 Jahren grundsätzlich nur nach fachkundiger Beratung. Eukalyptus, Pfefferminze und Kiefer sind unter 6 Jahren tabu – sie können bei Kindern zu Atemproblemen führen."),
  bullet("Asthma und Atemwegserkrankungen", "Vorsicht bei Eukalyptus, Kiefer und Pfefferminze. Immer erst mit sehr geringer Dosis testen."),
  bullet("Epilepsie", "Ketonhaltige Öle wie Rosmarin (Campher-Typ) und Fenchel meiden."),
  bullet("Bluthochdruck", "Zurückhaltung bei Rosmarin und Thymian."),
  bullet("Haustiere", "Katzen fehlt ein Enzym zum Abbau bestimmter Inhaltsstoffe. Vögel reagieren sehr empfindlich auf Aerosole. Diffusoren nur in gut belüfteten, für das Tier verlassbaren Räumen betreiben."),
  note("Dieses Buch dient der allgemeinen Information. Es ersetzt keine ärztliche Diagnose, Beratung oder Behandlung. Bei bestehenden Erkrankungen, in Schwangerschaft und Stillzeit, bei Kindern und Haustieren stets vorab fachlichen Rat einholen.")
);

// --- Die 30 Öl-Porträts ---
children.push(h1("Die 30 Öle im Porträt"));
children.push(p("Auf den folgenden Seiten finden Sie jedes Öl auf einer eigenen Seite – mit Abbildung der Pflanze, Herkunft, Gewinnung, Hauptinhaltsstoffen, gesundheitlichem Schwerpunkt, sieben konkreten Anwendungen für Alltag und Beschwerden sowie den jeweiligen Sicherheitshinweisen."));

oils.forEach((oil) => {
  children.push(
    h2(`${oil.nr}. ${oil.name}`, true),
    meta(`${oil.latin}  ·  ${oil.gruppe}`),
    image(oil.img),
    p(oil.text),
    new Paragraph({
      children: [
        new TextRun({ text: "Herkunft: ", bold: true, size: 19 }),
        new TextRun({ text: oil.herkunft + "   ", size: 19 }),
        new TextRun({ text: "Duft: ", bold: true, size: 19 }),
        new TextRun({ text: oil.duft, size: 19 }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Gewinnung: ", bold: true, size: 19 }),
        new TextRun({ text: oil.gewinnung + "   ", size: 19 }),
        new TextRun({ text: "Hauptinhaltsstoffe: ", bold: true, size: 19 }),
        new TextRun({ text: oil.inhalt, size: 19 }),
      ],
      spacing: { after: 150 },
    }),
    h3("Gesundheitliche Aspekte"),
    p(oil.gesundheit),
    h3("Anwendungsmöglichkeiten"),
    ...oil.anwendungen.map(([lead, text]) => bullet(lead, text)),
    note(oil.sicherheit)
  );
});

// --- Gesundheit im Fokus ---
children.push(h1("Gesundheit im Fokus", true));
children.push(p("Dieses Kapitel dreht die Perspektive um: Statt vom Öl auszugehen, starten wir beim Anliegen. Zu jedem Thema finden Sie die bewährten Öle und den passenden Anwendungsweg."));
gesundheit.forEach(([titel, oele, text]) => {
  children.push(
    h2(titel),
    new Paragraph({
      children: [
        new TextRun({ text: "Bewährte Öle: ", bold: true, color: GREEN_MID, size: 21 }),
        new TextRun({ text: oele, italics: true, size: 21 }),
      ],
      spacing: { after: 110 },
      keepNext: true, keepLines: true,
    }),
    p(text)
  );
});

// --- Rezepturen ---
children.push(h1("Rezepturen und Synergien"));
children.push(p("Bewährte Mischungen als Ausgangspunkt – passen Sie die Tropfenzahl gern an Ihre Duftvorliebe an. Als Trägeröl dient überall Olivenöl."));
rezepte.forEach(([titel, zutaten, anwendung]) => {
  children.push(
    h3(titel),
    p(zutaten, { bold: true, color: GREEN_MID, size: 21, keepNext: true }),
    p(anwendung, { size: 21 })
  );
});

// --- Tagesablauf ---
children.push(
  h1("Ätherische Öle im Tagesablauf", true),
  h2("Morgens – ankommen und wach werden"),
  p("Zitrusöle sind die natürlichen Verbündeten des Morgens. Zitrone, Orange oder Grapefruit im Diffusor, gern mit einem Tropfen Rosmarin ergänzt, unterstützen einen frischen Start. Wer schwer aus dem Bett kommt, kann einen Tropfen Grapefruit auf ein Taschentuch geben und schon vor dem Aufstehen tief einatmen."),
  h2("Vormittags – konzentriert arbeiten"),
  p("Rosmarin mit Zitrone gilt als die klassische Arbeitsmischung. Lassen Sie den Diffusor nicht durchgehend laufen: 30 bis 45 Minuten zu Beginn einer Arbeitsphase genügen, danach tritt Gewöhnung ein."),
  h2("Mittags – das Bauchgefühl"),
  p("Nach einer schweren Mahlzeit hat sich eine sanfte Bauchmassage im Uhrzeigersinn bewährt: zwei Tropfen Fenchel auf einen Esslöffel Olivenöl. Bei Müdigkeit nach dem Essen hilft ein Tropfen Pfefferminze zum Inhalieren."),
  h2("Nachmittags – das Tief überbrücken"),
  p("Statt zum dritten Kaffee zu greifen: Pfefferminze oder Grapefruit auf ein Taschentuch, dazu ein paar Minuten ans offene Fenster. Die Kombination aus Duft und frischer Luft wirkt oft überraschend gut."),
  h2("Abends – herunterfahren"),
  p("Hier beginnt die eigentliche Kunst. Lavendel, Bergamotte oder Römische Kamille im Diffusor, etwa eine Stunde vor dem Zubettgehen. Entscheidend ist die Regelmäßigkeit: Der Körper lernt, den Duft mit dem Übergang in die Nacht zu verknüpfen. Nach einigen Wochen wirkt allein der Duft als Einschlafsignal."),
  h2("Am Wochenende – bewusst Zeit nehmen"),
  p("Ein warmes Bad mit einer emulgierten Ölmischung, eine ausgiebige Selbstmassage mit Olivenöl oder eine Haarkur mit Zedernholz und Rosmarin. Solche längeren Rituale sind es, die aus einzelnen Anwendungen eine Praxis machen.")
);

// --- Qualität ---
children.push(
  h1("Qualität, Kauf und Lagerung"),
  h2("Woran Sie gute Öle erkennen"),
  p("Der Markt ist unübersichtlich, und der Begriff Aromaöl ist rechtlich nicht geschützt. Diese Merkmale trennen echte ätherische Öle von Duftölen:"),
  plainBullet("Der vollständige botanische Name steht auf dem Etikett, etwa Lavandula angustifolia."),
  plainBullet("Die Kennzeichnung lautet 100 % naturrein oder naturrein und unverschnitten."),
  plainBullet("Herkunftsland, Pflanzenteil und Gewinnungsart sind angegeben."),
  plainBullet("Eine Chargennummer ist vorhanden, idealerweise mit einsehbarer GC/MS-Analyse."),
  plainBullet("Das Öl ist in dunklem Glas abgefüllt, niemals in Kunststoff oder klarem Glas."),
  plainBullet("Die Preise unterscheiden sich deutlich zwischen den Ölen. Wenn Rose genauso viel kostet wie Orange, stimmt etwas nicht."),
  h2("Der Papiertest"),
  p("Ein einfacher Test für zu Hause: Geben Sie einen Tropfen auf ein Blatt Papier und lassen Sie es einen Tag liegen. Ein reines ätherisches Öl verflüchtigt sich weitgehend und hinterlässt höchstens einen leichten Schatten. Bleibt ein deutlicher Fettfleck zurück, wurde das Öl mit einem fetten Öl gestreckt. Ausnahmen sind naturgemäß die dickflüssigen Absolues und Harzöle."),
  h2("Richtig lagern"),
  p("Ätherische Öle sind lichtempfindlich und oxidieren an der Luft. Lagern Sie die Fläschchen dunkel und kühl – das Badezimmer ist wegen Feuchtigkeit und Temperaturschwankungen der schlechteste Ort. Verschließen Sie die Fläschchen nach jedem Gebrauch sofort. Zitrusöle halten sich im Kühlschrank deutlich länger. Notieren Sie das Öffnungsdatum direkt auf dem Etikett."),
  h2("Haltbarkeit im Überblick"),
  table(
    ["Ölgruppe", "Haltbarkeit", "Hinweis"],
    [
      ["Zitrusöle", "1–2 Jahre", "oxidieren schnell, kühl lagern"],
      ["Kräuter- und Nadelöle", "2–3 Jahre", "oxidiertes Öl reizt die Haut"],
      ["Blütenöle", "3–5 Jahre", "stabil bei dunkler Lagerung"],
      ["Holz-, Harz- und Wurzelöle", "5+ Jahre", "gewinnen mit der Zeit an Tiefe"],
    ],
    [2900, 2000, 4086]
  )
);

// --- FAQ ---
children.push(h1("Häufig gestellte Fragen"));
faq.forEach(([frage, antwort]) => {
  children.push(h3(frage), p(antwort, { size: 21 }));
});

// --- Fazit ---
children.push(
  h1("Fazit"),
  p("Ätherische Öle sind vielseitige Begleiter durch den Alltag – für ruhigen Schlaf, klare Gedanken, gepflegte Haut, freie Atemwege oder einfach einen Moment bewusster Achtsamkeit. Dreißig Öle klingen nach viel, doch niemand muss alle besitzen. Beginnen Sie mit fünf: Lavendel, Zitrone, Teebaum, Pfefferminze und Eukalyptus decken bereits einen großen Teil der Alltagsanwendungen ab. Der Rest wächst mit Ihrer Erfahrung."),
  p("Wie bei allem gilt: Qualität vor Menge, Respekt vor der Konzentration dieser Pflanzenkraft und ein achtsamer, informierter Umgang. Nehmen Sie sich Zeit zum Ausprobieren, führen Sie vielleicht ein kleines Notizbuch über Ihre Mischungen – und finden Sie in Ruhe heraus, welche Düfte zu Ihnen und Ihrem Leben passen."),
  rule(),
  h2("Wichtiger rechtlicher Hinweis"),
  p("Die Inhalte dieses E-Books dienen ausschließlich der allgemeinen Information und Bildung. Sie stellen keine medizinische, therapeutische oder pharmazeutische Beratung dar und ersetzen nicht den Besuch bei einer Ärztin, einem Arzt, einer Heilpraktikerin oder einem Heilpraktiker. Die beschriebenen Anwendungen beruhen auf traditioneller und volkskundlicher Nutzung sowie allgemeinen Erfahrungswerten der Aromapraxis und sind ausdrücklich nicht als Heilversprechen zu verstehen. Vor der Anwendung ätherischer Öle bei bestehenden Erkrankungen, in Schwangerschaft und Stillzeit, bei Kindern, älteren Menschen sowie bei Haustieren wird ausdrücklich empfohlen, vorab fachkundigen Rat einzuholen. Die Autorin bzw. der Autor übernimmt keine Haftung für Schäden, die aus der Anwendung der beschriebenen Informationen entstehen.", { italics: true, color: "555555", size: 20 })
);

// --- Anwendungsverzeichnis (automatisch erzeugt) ---
const index = new Map();
oils.forEach((o) => {
  o.anwendungen.forEach(([lead]) => {
    const key = lead.trim();
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(o.name);
  });
});
const sorted = [...index.entries()].sort((a, b) =>
  a[0].localeCompare(b[0], "de", { sensitivity: "base" })
);

let indexChildren = [];
indexChildren.push(h1("Anwendungsverzeichnis von A bis Z"));
indexChildren.push(p(`Alle ${sorted.length} Anwendungen dieses Buches alphabetisch geordnet – mit dem jeweils empfohlenen Öl. So finden Sie vom Anliegen aus schnell das passende Öl.`));

let currentLetter = "";
sorted.forEach(([anwendung, oelnamen]) => {
  const letter = anwendung[0].toUpperCase();
  if (letter !== currentLetter) {
    currentLetter = letter;
    indexChildren.push(
      new Paragraph({
        children: [new TextRun({ text: letter, bold: true, size: 26, color: GREEN_DARK })],
        spacing: { before: 200, after: 90 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 3 } },
      })
    );
  }
  indexChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: anwendung, size: 21 }),
        new TextRun({ text: "  ·  ", color: ACCENT, size: 21 }),
        new TextRun({ text: [...new Set(oelnamen)].join(", "), italics: true, color: GREEN_MID, size: 21 }),
      ],
      spacing: { after: 70 },
    })
  );
});

// ================= Export =================

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: TEXT_GRAY } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Cambria", size: 32, bold: true, color: GREEN_DARK },
        paragraph: {
          spacing: { before: 80, after: 150 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 8 } },
        },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Cambria", size: 26, bold: true, color: GREEN_MID },
        paragraph: { spacing: { before: 170, after: 75 } },
      },
    ],
  },
  sections: [
    {
      properties: { page: { margin: { top: 880, bottom: 820, left: 1080, right: 1080 } } },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Die heilende Kraft der Ätherischen Öle   ·   ", size: 16, color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" }),
              ],
            }),
          ],
        }),
      },
      children,
    },
    {
      properties: {
        page: { margin: { top: 880, bottom: 820, left: 1080, right: 1080 } },
        column: { count: 2, space: 400, separate: false },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Die heilende Kraft der Ätherischen Öle   ·   ", size: 16, color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999" }),
              ],
            }),
          ],
        }),
      },
      children: indexChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Die-heilende-Kraft-der-Aetherischen-Oele.docx", buffer);
  console.log("docx geschrieben:", Math.round(buffer.length / 1024), "KB");
  console.log("Anwendungen im Verzeichnis:", sorted.length);
});
