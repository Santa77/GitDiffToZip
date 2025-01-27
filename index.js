#!/usr/bin/env node

/**
 * gdtz - Node.js utilita na vytvorenie ZIP archívu z menených súborov
 * medzi dvomi Git commitmi.
 *
 * Použitie:
 *   gdtz <commitFrom> <commitTo>
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const AdmZip = require("adm-zip");

function printUsageAndExit() {
  console.log("Použitie: gdtz <commitFrom> <commitTo>");
  process.exit(1);
}

// 1) Parsovanie argumentov
const [,, commitFrom, commitTo] = process.argv;
if (!commitFrom || !commitTo) {
  printUsageAndExit();
}

// 2) Vytvoríme timestamp vo formáte yyyyMMddHHmmss
function getTimestamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}
const timeStamp = getTimestamp();

// Výsledný názov ZIP archívu
const outputZip = `changes_${commitFrom}_${commitTo}_${timeStamp}.zip`;

console.log(`Vytváram ZIP súbor: ${outputZip}`);

// 3) Získame zoznam zmenených súborov
let changedFiles;
try {
  changedFiles = execSync(`git diff --name-only ${commitFrom} ${commitTo}`, { encoding: "utf-8" })
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
} catch (err) {
  console.error("Chyba pri získavaní zoznamu súborov:", err.message);
  process.exit(1);
}

if (changedFiles.length === 0) {
  console.log(`Žiadne zmenené súbory medzi ${commitFrom} a ${commitTo}.`);
  process.exit(0);
}

// 4) Vytvoríme dočasný priečinok na extrahované súbory
const tmpDir = path.join(os.tmpdir(), `gdtz_${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

console.log(`Dočasný priečinok: ${tmpDir}`);

// 5) Pre každý zmenený súbor stiahneme obsah z commitTo (git show)
changedFiles.forEach(file => {
  const destFile = path.join(tmpDir, file);

  // Vytvoríme podpriečinky
  const destDir = path.dirname(destFile);
  fs.mkdirSync(destDir, { recursive: true });

  try {
    // Prečítame binárny obsah zo `git show commitTo:file`
    const data = execSync(`git show ${commitTo}:${file}`, { encoding: "buffer" });
    // Zapíšeme do súboru
    fs.writeFileSync(destFile, data);
  } catch (err) {
    console.warn(`[CHYBA] Nepodarilo sa stiahnuť súbor ${file} z commitu ${commitTo}.`, err.message);
  }
});

// 6) Vytvoríme ZIP archív (adm-zip)
console.log("Zbalujem súbory do ZIP...");
try {
  const zip = new AdmZip();
  zip.addLocalFolder(tmpDir); // pridáme celý dočasný priečinok
  zip.writeZip(outputZip);
} catch (err) {
  console.error("Chyba pri vytváraní ZIP archívu:", err.message);
  process.exit(1);
}

// 7) Zmažeme dočasný priečinok
try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (err) {
  console.warn("Nepodarilo sa odstrániť dočasný priečinok:", err.message);
}

// Hotovo
console.log(`Hotovo! Vytvorený archív: ${outputZip}`);
