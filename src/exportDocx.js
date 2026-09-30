import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, ImageRun,
} from "docx";
import { chiSquareTest } from "./realStats.js";

const NAVY = "1F3864";
const GOLD = "C99A2E";

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    border: { bottom: { color: GOLD, space: 3, style: BorderStyle.SINGLE, size: 10 } },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 28 })],
  });
}
function p(text) {
  return new Paragraph({
    spacing: { after: 120, line: 300 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text: text || "—", size: 21 })],
  });
}
function bullet(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 21 })] });
}
function cell(text, header) {
  return new TableCell({
    shading: header ? { type: ShadingType.CLEAR, fill: NAVY } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: String(text ?? ""), bold: header, color: header ? "FFFFFF" : "000000", size: 19 })] })],
  });
}
function table(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((r, i) => new TableRow({ children: r.map((v) => cell(v, i === 0)) })),
  });
}

// Décode une data URL "data:image/png;base64,...." (produite par captureChartAsDataURL, cf.
// chartExport.js) en tableau d'octets exploitable par ImageRun — docx ne sait pas lire une data
// URL directement, il lui faut les octets bruts de l'image.
function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Insère l'image d'un graphe (si capturée à l'export) redimensionnée pour tenir sur la largeur de
// page utile (env. 560 px en conservant les proportions d'origine), sans jamais l'agrandir au-delà
// de sa taille source.
function chartImageParagraph(captured) {
  if (!captured?.dataUrl) return null;
  const MAX_WIDTH = 560;
  const ratio = captured.width > 0 ? Math.min(1, MAX_WIDTH / captured.width) : 1;
  const width = Math.round(captured.width * ratio);
  const height = Math.round(captured.height * ratio);
  try {
    return new Paragraph({
      spacing: { before: 80, after: 160 },
      children: [
        new ImageRun({
          data: dataUrlToUint8Array(captured.dataUrl),
          transformation: { width, height },
          type: "png",
        }),
      ],
    });
  } catch {
    return null;
  }
}

// Tableau croisé (contingence) pour les tests du Khi²/V de Cramér, recalculé directement à partir
// de la base importée — au même titre que celui affiché à l'écran dans Résultats & rapport — plutôt
// que de s'en tenir au seul résumé chiffré (χ², p, V) déjà présent dans item.detail.
function crosstabTable(item, dataset) {
  if (!dataset || !item.xId || !item.yId) return null;
  try {
    const c = chiSquareTest(dataset.rows, item.xId, item.yId);
    const header = [`${item.xLabel} \\ ${item.yLabel}`, ...c.yList];
    const rows = c.xList.map((x) => [x, ...c.yList.map((y) => String(c.table[x]?.[y] || 0))]);
    return table([header, ...rows]);
  } catch {
    return null;
  }
}

export async function exportReportToDocx({ context, queue, uniQueue, aiReport, dataset, chartImages }) {
  const ctx = context || {};
  const indicateurs = ctx.indicateurs || [];

  const univariateParagraphs = (uniQueue || []).flatMap((u) => {
    const s = u.stats;
    const detail = u.isQuantitative
      ? `Moyenne = ${s.moyenne.toFixed(2)}, médiane = ${s.mediane.toFixed(2)}, écart-type = ${s.ecartType.toFixed(2)}, min = ${s.min.toFixed(2)}, max = ${s.max.toFixed(2)}` +
        (s.outliers?.count > 0 ? `, ${s.outliers.count} valeur(s) atypique(s) détectée(s) (méthode interquartile)` : ", aucune valeur atypique détectée (méthode interquartile)")
      : (s || []).map((f) => `${f.modalite} : ${f.pct.toFixed(0)}% (n=${f.n})`).join(" ; ");
    return [
      new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [new TextRun({ text: `${u.variableLabel} — ${u.isQuantitative ? "Statistiques descriptives" : "Fréquences"} (univariée)`, bold: true, color: NAVY, size: 22 })],
      }),
      p(detail),
    ];
  });

  // Tableaux croisés (Khi²/Cramér) et images de graphes (captureChartAsDataURL, cf.
  // ResultsReport.jsx) : chaque analyse est désormais accompagnée, quand elle est disponible, de
  // sa représentation visuelle ou de sa table de contingence, plutôt que du seul texte du résultat.
  const resultParagraphs = (queue || []).flatMap((item) => {
    const blocks = [
      new Paragraph({
        spacing: { before: 160, after: 40 },
        children: [new TextRun({ text: `${item.label} — ${item.test}`, bold: true, color: NAVY, size: 22 })],
      }),
      p(item.detail || "Résultat non disponible."),
    ];
    const isChi2 = item.test === "Test du Khi² d'indépendance" || item.test === "V de Cramér (mesure d'association)";
    if (isChi2) {
      const ct = crosstabTable(item, dataset);
      if (ct) blocks.push(ct, new Paragraph({ spacing: { after: 160 }, children: [] }));
    } else {
      const captured = chartImages?.[item.id];
      const img = captured ? chartImageParagraph(captured) : null;
      if (img) blocks.push(img);
    }
    return blocks;
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            border: { bottom: { color: GOLD, space: 8, style: BorderStyle.SINGLE, size: 16 } },
            children: [new TextRun({ text: "RAPPORT D'ANALYSE", bold: true, color: NAVY, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: "AgriHakStat — Généré le " + new Date().toLocaleDateString("fr-FR"), color: GOLD, size: 22, bold: true })],
          }),

          h1("1. Contexte de l'étude"),
          p(ctx.objectif),
          bullet(`Zone géographique : ${(ctx.communes || []).join(", ") || "non renseignée"}`),
          bullet(`Filière(s) : ${(ctx.filieres || []).join(", ") || "non renseignée(s)"}`),
          bullet(`Période de référence : ${ctx.periodeDebut || "?"} → ${ctx.periodeFin || "?"}`),
          bullet(`Unité d'analyse : ${ctx.uniteAnalyse || "non renseignée"}`),
          bullet(`Base de données : ${dataset ? `${dataset.fileName} (${dataset.rows.length} enregistrements)` : "aucune base réelle importée"}`),

          h1("2. Indicateurs de performance mesurés"),
          indicateurs.length > 0
            ? table([["Indicateur", "Formule", "Seuil"], ...indicateurs.map((k) => [k.nom, k.formule, k.seuil || "ND"])])
            : p("Aucun indicateur déclaré."),

          h1("3. Résultats"),
          (uniQueue && uniQueue.length > 0) ? univariateParagraphs : [],
          (queue && queue.length > 0) ? resultParagraphs : [],
          (!queue || queue.length === 0) && (!uniQueue || uniQueue.length === 0) ? [p("Aucune analyse validée pour ce rapport.")] : [],

          h1("4. Analyse"),
          p(aiReport?.analyse || "Section à compléter par l'analyste."),

          h1("5. Recommandations"),
          p(aiReport?.recommandations || "Section à compléter par l'analyste."),

          h1("6. Conclusion"),
          p(aiReport?.conclusion || "Section à compléter par l'analyste."),

          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "AgriHakStat — Conçu par Hakibou MOUSSA", italics: true, size: 18, color: "999999" })],
          }),
        ].flat(),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Rapport_AgriHakStat_${new Date().toISOString().slice(0, 10)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
