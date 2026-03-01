import { readFileSync } from "fs";

// Parse GLB binary header and extract JSON chunk
const buf = readFileSync("public/car-models/rr/rolls royce ghost.glb");
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546C67) throw new Error("Not a GLB file");

const jsonLen = buf.readUInt32LE(12);
const jsonChunk = buf.subarray(20, 20 + jsonLen).toString("utf8");
const gltf = JSON.parse(jsonChunk);

console.log("=== NODES ===");
(gltf.nodes || []).forEach((n, i) => {
    const meshIdx = n.mesh !== undefined ? n.mesh : null;
    const meshName = meshIdx !== null && gltf.meshes?.[meshIdx] ? gltf.meshes[meshIdx].name : "";
    console.log(`${i}\t${n.name || "(unnamed)"}\t${meshName ? "mesh=" + meshName : ""}\t${n.children ? "children=" + n.children.join(",") : ""}`);
});

console.log("\n=== MESHES ===");
(gltf.meshes || []).forEach((m, i) => console.log(`${i}\t${m.name}`));

console.log("\n=== MATERIALS ===");
(gltf.materials || []).forEach((m, i) => console.log(`${i}\t${m.name}`));
