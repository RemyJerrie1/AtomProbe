import { describe, it, expect } from "vitest";
import { parseTopLevelAtoms, groupAtoms } from "./atoms";

// Build one box: header (size big-endian + 4-byte type), rest zero-filled.
function box(type: string, totalSize: number): Uint8Array {
  const b = new Uint8Array(totalSize);
  new DataView(b.buffer).setUint32(0, totalSize);
  for (let i = 0; i < 4; i++) b[4 + i] = type.charCodeAt(i);
  return b;
}
function file(boxes: Uint8Array[]): ArrayBuffer {
  const total = boxes.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const b of boxes) {
    out.set(b, o);
    o += b.length;
  }
  return out.buffer;
}

describe("parseTopLevelAtoms", () => {
  it("not faststart: moov after mdat", () => {
    const r = parseTopLevelAtoms(file([box("ftyp", 16), box("mdat", 64), box("moov", 32)]));
    expect(r.order).toEqual(["ftyp", "mdat", "moov"]);
    expect(r.faststart).toBe(false);
    expect(r.moovIndex).toBeGreaterThan(r.mdatIndex);
  });

  it("faststart: moov before mdat", () => {
    const r = parseTopLevelAtoms(file([box("ftyp", 16), box("moov", 32), box("mdat", 64)]));
    expect(r.order).toEqual(["ftyp", "moov", "mdat"]);
    expect(r.faststart).toBe(true);
    expect(r.moovIndex).toBeLessThan(r.mdatIndex);
  });

  it("handles 64-bit largesize box (size==1)", () => {
    const total = 24;
    const big = new Uint8Array(total);
    const dv = new DataView(big.buffer);
    dv.setUint32(0, 1); // size==1 → use the 64-bit largesize
    "mdat".split("").forEach((c, i) => (big[4 + i] = c.charCodeAt(0)));
    dv.setUint32(8, 0); // largesize high
    dv.setUint32(12, total); // largesize low = 24
    const r = parseTopLevelAtoms(file([box("ftyp", 16), big]));
    expect(r.order).toEqual(["ftyp", "mdat"]);
    expect(r.atoms[1].size).toBe(24);
  });

  it("stops safely on a broken box (size<8)", () => {
    const r = parseTopLevelAtoms(file([box("ftyp", 16)]).slice(0, 20)); // truncated
    expect(r.atoms.length).toBeGreaterThanOrEqual(1);
  });

  it("detects fragmented mp4 (moof present) and counts types", () => {
    const r = parseTopLevelAtoms(
      file([
        box("ftyp", 16),
        box("moov", 32),
        box("moof", 24),
        box("mdat", 64),
        box("moof", 24),
        box("mdat", 64),
      ])
    );
    expect(r.fragmented).toBe(true);
    expect(r.counts).toMatchObject({ ftyp: 1, moov: 1, moof: 2, mdat: 2 });
  });
});

describe("groupAtoms", () => {
  it("run-length encodes consecutive identical types", () => {
    const r = parseTopLevelAtoms(
      file([box("ftyp", 16), box("free", 16), box("free", 16), box("moov", 16), box("mdat", 16)])
    );
    expect(groupAtoms(r.atoms)).toEqual([
      { type: "ftyp", count: 1 },
      { type: "free", count: 2 },
      { type: "moov", count: 1 },
      { type: "mdat", count: 1 },
    ]);
  });
});
