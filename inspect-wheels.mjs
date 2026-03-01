import { readFileSync } from "fs";

const buf = readFileSync("public/car-models/rr/rolls royce ghost.glb");
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));

// Find wheel-related nodes
const wheelKeywords = ["whell", "wheel", "rim", "spoke", "rotor", "brake", "tire", "rubber", "empty"];
const nodes = gltf.nodes || [];

console.log("=== WHEEL-RELATED NODES (with transforms) ===\n");
nodes.forEach((n, i) => {
    const name = (n.name || "").toLowerCase();
    if (!wheelKeywords.some(k => name.includes(k))) return;
    
    const mesh = n.mesh !== undefined ? gltf.meshes[n.mesh] : null;
    const mat = mesh?.primitives?.[0]?.material !== undefined 
        ? gltf.materials[mesh.primitives[0].material]?.name 
        : null;
    
    console.log(`Node[${i}] "${n.name}"`);
    if (mesh) console.log(`  mesh: "${mesh.name}" | material: "${mat}"`);
    if (n.translation) console.log(`  pos: [${n.translation.map(v => v.toFixed(4)).join(", ")}]`);
    if (n.rotation) console.log(`  rot: [${n.rotation.map(v => v.toFixed(4)).join(", ")}]`);
    if (n.scale) console.log(`  scale: [${n.scale.map(v => v.toFixed(4)).join(", ")}]`);
    if (n.children) console.log(`  children: [${n.children.join(", ")}]`);
    
    // Find parent
    const parentIdx = nodes.findIndex(p => p.children?.includes(i));
    if (parentIdx >= 0) console.log(`  parent: Node[${parentIdx}] "${nodes[parentIdx].name}"`);
    console.log("");
});

// Also inspect the Vossen rim
console.log("\n=== VOSSEN RIM STRUCTURE ===\n");
const buf2 = readFileSync("public/car-models/rims/vossen_1_front.glb");
const jsonLen2 = buf2.readUInt32LE(12);
const vossen = JSON.parse(buf2.subarray(20, 20 + jsonLen2).toString("utf8"));

console.log("Nodes:");
(vossen.nodes || []).forEach((n, i) => {
    const mesh = n.mesh !== undefined ? vossen.meshes[n.mesh] : null;
    const mat = mesh?.primitives?.[0]?.material !== undefined 
        ? vossen.materials[mesh.primitives[0].material]?.name 
        : null;
    console.log(`  [${i}] "${n.name}" ${mesh ? `mesh="${mesh.name}" mat="${mat}"` : ""} ${n.children ? `children=[${n.children}]` : ""}`);
    if (n.translation) console.log(`      pos: [${n.translation.map(v => v.toFixed(4)).join(", ")}]`);
    if (n.rotation) console.log(`      rot: [${n.rotation.map(v => v.toFixed(4)).join(", ")}]`);
    if (n.scale) console.log(`      scale: [${n.scale.map(v => v.toFixed(4)).join(", ")}]`);
});
console.log("\nMaterials:");
(vossen.materials || []).forEach((m, i) => console.log(`  [${i}] "${m.name}"`));
