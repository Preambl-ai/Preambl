/**
 * Procedural die-surface shader, injected into MeshStandardMaterial via
 * onBeforeCompile so the transistor field gets real PBR lighting + env
 * reflections, while emissive energy is fully procedural.
 *
 * The pattern is purely visual: a stylised "die shot" look (cells, arrays,
 * routing channels, seal ring, pad ring). It does not depict any real
 * layout or process.
 *
 * TODO(confidential-review): confirm the stylised cell/array vocabulary in
 * the comments below is acceptable for public release. Nothing here
 * describes a method, but a reviewer should sign off on the wording.
 */

export const dieUniformsGLSL = /* glsl */ `
uniform float uProgress;     // 0..1 scroll progress
uniform float uTime;
uniform float uSeed;         // per-product variation
uniform float uBlocks;       // functional blocks per side
uniform float uCellScale;    // base cells per die edge
uniform float uCenterScale;  // fixed cell count for the centre block (matches MicroCells)
uniform float uLite;         // 1 = mobile / reduced shader cost
uniform float uHum;          // idle hum amplitude once powered
uniform float uPowerStart;
uniform float uPowerFull;
uniform vec3  uAccent;
uniform vec3  uAccentHi;
uniform vec3  uCore;
uniform vec3  uAmber;        // rare pop accent: pulses riding the traces
uniform vec3  uMetal;
uniform vec3  uMetalHi;

float pb_hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float pb_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(
    mix(pb_hash(i), pb_hash(i + vec2(1., 0.)), f.x),
    mix(pb_hash(i + vec2(0., 1.)), pb_hash(i + vec2(1., 1.)), f.x),
    f.y);
}
float pb_fbm(vec2 p) {
  float v = 0.;
  float a = .5;
  for (int i = 0; i < 4; i++) {
    if (uLite > .5 && i > 2) break;
    v += a * pb_noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= .5;
  }
  return v;
}
float pb_box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.)) + min(max(d.x, d.y), 0.);
}
float pb_fill(float d, float aa) { return 1. - smoothstep(-aa, aa, d); }

// Signed distance to the Preambl mark (eight bars, 1010 0101: tall short tall short short tall short tall),
// centred on the active area. Proportions follow the logo artwork.
float pb_logo(vec2 p, out float barIdx) {
  const float W = 0.56;                 // logo width in active-area uv
  const float bw = W * (56.7 / 684.46); // bar width
  const float hT = W * (280.27 / 684.46);
  const float hS = W * (115.83 / 684.46);
  float y0 = 0.5 - hT * 0.5;            // shared baseline
  float d = 1e3;
  barIdx = -1.;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    // bar left edges in the artwork: 4 bars, a wider gap, then 4 more
    float lx = fi < 3.5 ? fi * 85.05 : 372.61 + (fi - 4.) * 85.05;
    float x0 = 0.5 - W * 0.5 + W * (lx / 684.46);
    bool tall = (i == 0 || i == 2 || i == 5 || i == 7);
    float h = tall ? hT : hS;
    float bd = pb_box(p - vec2(x0 + bw * 0.5, y0 + h * 0.5), vec2(bw * 0.5, h * 0.5));
    if (bd < d) { d = bd; barIdx = fi; }
  }
  return d;
}
`

/** Replaces `#include <map_fragment>`. Produces diffuseColor + pb_* locals. */
export const dieSurfaceGLSL = /* glsl */ `
// ---------------- layout ----------------
vec2 dUv = vUv;
float aa0 = fwidth(dUv.x) + 1e-5;

// margin: seal ring + pad ring live here; the active area is inside
float margin = 0.052;
vec2 auv = (dUv - margin) / (1. - 2. * margin);
vec2 eA = min(auv, 1. - auv);
float inActive = step(0., min(eA.x, eA.y));

float edgeD = min(min(dUv.x, 1. - dUv.x), min(dUv.y, 1. - dUv.y));
float ring = pb_fill(abs(edgeD - 0.040) - 0.0022, aa0) + pb_fill(abs(edgeD - 0.047) - 0.0012, aa0);
ring = clamp(ring, 0., 1.);

// pad ring along the perimeter (bond pads on the die)
vec2 ee = vec2(min(dUv.x, 1. - dUv.x), min(dUv.y, 1. - dUv.y));
float along = (ee.x < ee.y) ? dUv.y : dUv.x;
float padCount = 22.;
vec2 padUv = vec2(fract(along * padCount) - .5, (edgeD - 0.019) / 0.028);
float pad = pb_fill(pb_box(padUv, vec2(0.26, 0.5)), aa0 * padCount) * step(0.006, edgeD) * step(edgeD, 0.033);
// keep pads off the corners
pad *= step(0.045, along) * step(along, 0.955);

// functional blocks
vec2 bidf = floor(auv * uBlocks);
vec2 buv = fract(auv * uBlocks);
float bh  = pb_hash(bidf + uSeed);
float bh2 = pb_hash(bidf * 1.7 + uSeed + 3.1);
float bh3 = pb_hash(bidf * 3.3 + uSeed + 7.7);
float btype = floor(bh * 3.);           // 0 logic, 1 array, 2 sparse
float brot  = step(.5, bh2);
float scaleCells = (uCellScale / uBlocks) * mix(0.75, 1.35, bh3);
float centerIdx = floor(uBlocks * 0.5);
float isCenter = step(abs(bidf.x - centerIdx) + abs(bidf.y - centerIdx), 0.5);
btype = mix(btype, 0., isCenter);
brot  = mix(brot, 0., isCenter);
scaleCells = mix(scaleCells, uCenterScale, isCenter);

// routing channel between blocks
vec2 eB = min(buv, 1. - buv);
float edgeB = min(eB.x, eB.y);
float chW = 0.04;
float aaB = aa0 * uBlocks;
float channel = (1. - smoothstep(chW - aaB, chW + aaB, edgeB)) * inActive;
float chCoord  = (eB.x < eB.y) ? buv.y : buv.x;
float chAcross = edgeB / chW;
float chLines  = pb_fill(abs(fract(chAcross * 4. + .5) - .5) - .17, aaB / chW * 1.2);
float traceMask = channel * chLines;

// cells
vec2 cuv = mix(buv, buv.yx, brot) * scaleCells;
vec2 cid = floor(cuv);
vec2 cf  = fract(cuv) - .5;
float pxPerCell = 1. / max(fwidth(cuv.x), 1e-4);
float aaC = 0.7 / max(pxPerCell, 1.) + 0.01;
float ch = pb_hash(cid + bidf * 13.7 + uSeed);
float structure = 0.;
float cellTrace = 0.;
if (btype < 0.5) {
  float gate = pb_fill(pb_box(cf, vec2(0.11, 0.30)), aaC);
  float cA = pb_fill(pb_box(cf - vec2(0.30, 0.22), vec2(0.07)), aaC);
  float cB = pb_fill(pb_box(cf + vec2(0.30, 0.22), vec2(0.07)), aaC);
  float wire = pb_fill(abs(cf.y) - 0.035, aaC) * step(0.4, ch);
  structure = max(max(gate, max(cA, cB)), wire * 0.7);
  cellTrace = wire;
} else if (btype < 1.5) {
  vec2 q = vec2(fract(cuv.x * 2.) - .5, cf.y);
  float bit = pb_fill(pb_box(q, vec2(0.21, 0.25)), aaC);
  float wl  = pb_fill(abs(cf.y - 0.44) - 0.03, aaC);
  structure = max(bit * mix(0.75, 1., step(0.1, ch)), wl * 0.8);
  cellTrace = wl;
} else {
  float big = pb_fill(pb_box(cf, vec2(0.34, 0.20)), aaC) * step(0.35, ch);
  float vline = pb_fill(abs(cf.x) - 0.03, aaC);
  structure = max(big, vline * 0.6);
  cellTrace = vline;
}
// sub-pixel cells collapse to their average so the field reads as texture
float resolve = smoothstep(1.5, 7., pxPerCell);
structure = mix(0.17, structure, resolve) * inActive;
structure = max(structure, traceMask);
float metalMask = max(max(structure, ring), pad);

// ---------------- energy ----------------
float power = smoothstep(uPowerStart, uPowerFull, uProgress);
float front = power * 1.4;
// Stage 1: the logo. Its eight bars light first, one after another left to right,
// so the opening frames of the scroll show the Preambl mark burning into the die.
float barIdx;
float dLogo = pb_logo(auv, barIdx);
float logoMask = pb_fill(dLogo, aa0 * 1.5) * inActive;
float tLogo = 0.03 + barIdx * 0.014;
// Stage 2: after a short hold, energy breaks out of the logo and spreads chaotically:
// distance from the mark, warped hard by noise, jumping block to block and cell to cell,
// running ahead along the routing channels.
float chaos = (pb_fbm(auv * 6. + uSeed + vec2(0., power * .6)) - .5) * .55
            + (bh - .5) * .16
            + (ch - .5) * .07;
float dOut = 0.3 + max(dLogo, 0.) * 1.55 + chaos;
dOut -= channel * .12 + traceMask * .05;
float dEn = mix(max(dOut, 0.22), tLogo, logoMask);
dEn = mix(dEn, 0.5 + pb_hash(floor(vec2(along * padCount, 0.))) * .1, pad); // pads join after the logo, staggered
float behind = front - dEn;
float lit   = smoothstep(0., .015, behind);
float flash = exp(-max(behind, 0.) * 14.) * lit;
float band  = smoothstep(.07, 0., abs(behind)) * inActive * smoothstep(0., .04, power) * (1. - smoothstep(.97, 1., power));
float hum   = 1. + uHum * .08 * sin(uTime * 1.7 + pb_fbm(auv * 3.) * 6.28);
float steady = lit * hum;

// pulses flowing along traces once powered
float tcoord = mix(cuv.x, cuv.y, brot) * 0.25 + chCoord * 6.;
float pulse = pow(fract(tcoord - uTime * .45 + bh * 3.), 10.) * max(cellTrace * resolve, traceMask) * lit;

// crackle / arcs riding the front
float arcN = pb_noise(auv * 140. + uTime * 9. + uSeed);
float arc  = step(0.975 + uLite * 0.012, arcN) * band * 3.;
float bolt = smoothstep(.02, 0., abs(pb_fbm(auv * 24. + uTime * .6) - .5)) * band * 1.8;

float eStruct = pow(metalMask, 1.3) * (steady * .8 + flash * 3.2);
vec3 emis = uAccent * eStruct
          + mix(uAccentHi, uAmber, .65) * pulse * 1.7
          + uCore * (flash * metalMask * 1.2 + arc + bolt);
emis += uAccent * channel * lit * .45;   // channels keep a steady floor glow
emis += vec3(1.) * pad * lit * .6;
// One energy layer for everything: every lit point of the active area gets the same soft fill.
// While only the logo is lit it reads as the mark; once the rest catches up it blends in and disappears.
emis += uAccent * lit * inActive * .55;

// ---------------- surface ----------------
float grain = pb_noise(dUv * 900.) * .06;
vec3 base = mix(uMetal, uMetalHi, metalMask * .7 + grain);
base *= mix(.9, 1.06, bh);
base = mix(base, base * .7, channel * (1. - traceMask));
base *= 1. - ring * .25;
base = mix(base, vec3(1.), pad * .9); // bond pads: white
diffuseColor.rgb = base;
float pb_rough = mix(.62, .30, metalMask);
float pb_metal = mix(.55, .96, metalMask);
vec3  pb_emis  = emis;
`

export const dieRoughnessGLSL = /* glsl */ `float roughnessFactor = pb_rough;`
export const dieMetalnessGLSL = /* glsl */ `float metalnessFactor = pb_metal;`
export const dieEmissiveGLSL = /* glsl */ `totalEmissiveRadiance = pb_emis;`
