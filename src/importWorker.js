// Web Worker dédié à l'analyse des fichiers Excel (.xlsx/.xls) importés dans l'Assistant d'import.
//
// Pourquoi un worker : XLSX.read() puis sheet_to_json() s'exécutent de façon strictement
// synchrone et peuvent prendre plusieurs secondes sur un classeur volumineux (plusieurs milliers
// de lignes/colonnes) — exécutés sur le fil principal, ils gèlent entièrement l'interface (aucun
// retour visuel, impossibilité d'annuler ou de naviguer) pendant toute leur durée. En déportant ce
// calcul ici, le fil principal reste réactif et peut afficher une progression réelle.
//
// Contrat de message :
//  postMessage({ id, fileName, buffer }) → ArrayBuffer du fichier (transférable)
//  Réponses :
//   { id, type: "progress", phase, pct }
//   { id, type: "done", rows, columns, fileName, warnings }
//   { id, type: "error", message }

import * as XLSX from "xlsx";
import { buildColumnsMeta } from "./realStats.js";

function isEmptyRow(row) {
  return Object.values(row).every((v) => v === "" || v === null || v === undefined);
}

// Détecte les en-têtes dupliqués et les lignes entièrement vides — deux défauts structurels
// fréquents (fusion de colonnes ODK/KoboToolbox, lignes de séparation dans les exports Excel) qui
// passaient auparavant silencieusement : une colonne en double écrasait la précédente sans avertir
// l'utilisateur, et les lignes vides faussaient les effectifs affichés dans les analyses.
function validateStructure(headerRow, rawRows) {
  const warnings = [];
  const counts = new Map();
  (headerRow || []).forEach((h) => {
    const key = String(h ?? "").trim().toLowerCase();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const dups = [...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k);
  if (dups.length > 0) {
    warnings.push(
      `En-tête(s) en double détecté(s) (${dups.join(", ")}) — seule la dernière colonne portant ce nom a été conservée pour chaque cas ; renommez les colonnes source si ce n'est pas l'intention.`
    );
  }
  const emptyCount = (rawRows || []).filter(isEmptyRow).length;
  if (emptyCount > 0) {
    warnings.push(`${emptyCount} ligne(s) entièrement vide(s) détectée(s) et exclue(s) de l'analyse.`);
  }
  return warnings;
}

self.onmessage = (e) => {
  const { id, fileName, buffer } = e.data;
  try {
    self.postMessage({ id, type: "progress", phase: "lecture", pct: 40 });
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];

    self.postMessage({ id, type: "progress", phase: "analyse", pct: 65 });
    const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })[0] || [];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const warnings = validateStructure(headerRow, rawRows);
    const rows = rawRows.filter((r) => !isEmptyRow(r));

    self.postMessage({ id, type: "progress", phase: "typage", pct: 90 });
    const columns = buildColumnsMeta(rows);

    self.postMessage({ id, type: "done", rows, columns, fileName, warnings });
  } catch (err) {
    self.postMessage({ id, type: "error", message: err.message || String(err) });
  }
};
