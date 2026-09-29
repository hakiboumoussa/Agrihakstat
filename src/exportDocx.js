import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType,
} from "docx";

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

export async function exportReportToDocx({ context, queue, aiReport, dataset }) {
  const ctx = context || {};
  const indicateurs = ctx.indicateurs || [];

  const resultParagraphs = (queue || []).flatMap((item) => [
    new Paragraph({
      spacing: { before: 160, after: 40 },
      children: [new TextRun({ text: `${item.label} — ${item.test}`, bold: true, color: NAVY, size: 22 })],
    }),
    p(item.detail || "Résultat non disponible."),
  ]);

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
          queue && queue.length > 0 ? resultParagraphs : [p("Aucune analyse validée pour ce rapport.")],

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
