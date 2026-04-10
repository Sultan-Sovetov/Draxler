import fs from "fs";
import path from "path";
import { CAR_RIM_MAPPINGS } from "../src/data/car-rims-mesh.js";

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "custom meshes.txt");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "imported-snapshot-calibrations.ts");

const raw = fs.readFileSync(INPUT_PATH, "utf8");
let depth = 0;
let start = -1;
const chunks = [];
for (let i = 0; i < raw.length; i++) {
  const ch = raw[i];
  if (ch === "{") {
    if (depth === 0) start = i;
    depth += 1;
  } else if (ch === "}") {
    depth -= 1;
    if (depth === 0 && start !== -1) {
      chunks.push(raw.slice(start, i + 1));
      start = -1;
    }
  }
}

const rows = chunks.map((chunk, index) => {
  try {
    return JSON.parse(chunk);
  } catch (error) {
    throw new Error(`Failed to parse object ${index + 1}: ${error.message}`);
  }
});

const byCar = {};
const firstWheelByCarFile = new Map();
for (const row of rows) {
  const carModelPath = (row.carModelPath || "").trim();
  const carKey = carModelPath.replace(/^\/car-models\//, "");
  const carGlb = (row.carGlb || "").trim();
  const rimKey = (row.rimGlb || "").trim();
  const stats = row.stats || null;
  if (!carKey || !carGlb || !rimKey || !stats) continue;

  if (!firstWheelByCarFile.has(carGlb) && row.wheelPositions) {
    firstWheelByCarFile.set(carGlb, row.wheelPositions);
  }

  byCar[carKey] ??= {};
  byCar[carKey][rimKey] = {
    scale: stats.scale,
    offsetY: stats.offsetY,
    rotYLeft: stats.rotYLeft,
    rotYRight: stats.rotYRight,
    offsetXLeft: stats.offsetXLeft,
    offsetXRight: stats.offsetXRight,
    offsetZFront: stats.offsetZFront,
    offsetZRear: stats.offsetZRear,
  };
}

const mappingIssues = [];
for (const [carGlb, incoming] of firstWheelByCarFile.entries()) {
  const existing = CAR_RIM_MAPPINGS[carGlb];
  if (!existing) {
    mappingIssues.push(`missing mapping: ${carGlb}`);
    continue;
  }
  if (JSON.stringify(existing) !== JSON.stringify(incoming)) {
    mappingIssues.push(`mapping mismatch: ${carGlb}`);
  }
}

const cars = Object.keys(byCar).sort();
const lines = [];
lines.push("// AUTO-GENERATED from custom meshes.txt. Do not edit manually.");
lines.push("");
lines.push("export type ImportedSnapshotRimCalibration = {");
lines.push("    scale?: number;");
lines.push("    offsetY?: number;");
lines.push("    rotYLeft?: number;");
lines.push("    rotYRight?: number;");
lines.push("    offsetXLeft?: number;");
lines.push("    offsetXRight?: number;");
lines.push("    offsetZFront?: number;");
lines.push("    offsetZRear?: number;");
lines.push("};");
lines.push("");
lines.push("export const IMPORTED_SNAPSHOT_RIM_CALIBRATIONS: Record<string, Record<string, ImportedSnapshotRimCalibration>> = {");
for (const car of cars) {
  lines.push(`    \"${car}\": {`);
  const rims = Object.keys(byCar[car]).sort();
  for (const rim of rims) {
    const s = byCar[car][rim];
    lines.push(`        \"${rim}\": { scale: ${s.scale}, offsetY: ${s.offsetY}, rotYLeft: ${s.rotYLeft}, rotYRight: ${s.rotYRight}, offsetXLeft: ${s.offsetXLeft}, offsetXRight: ${s.offsetXRight}, offsetZFront: ${s.offsetZFront}, offsetZRear: ${s.offsetZRear} },`);
  }
  lines.push("    },");
}
lines.push("};");
lines.push("");

fs.writeFileSync(OUTPUT_PATH, lines.join("\n"));

console.log(`parsed_objects=${rows.length}`);
console.log(`generated_cars=${cars.length}`);
if (mappingIssues.length > 0) {
  console.log(`mapping_issues=${mappingIssues.length}`);
  for (const issue of mappingIssues) console.log(issue);
} else {
  console.log("mapping_issues=0");
}
console.log(`written=${path.relative(ROOT, OUTPUT_PATH)}`);
