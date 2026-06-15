import { describe, it, expect } from "vitest";
import { parseTopLevelAtoms } from "./atoms";

// 建一個 box header(size big-endian + 4-byte type),其餘填 0。
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
  it("非 faststart:moov 在 mdat 之後", () => {
    const r = parseTopLevelAtoms(file([box("ftyp", 16), box("mdat", 64), box("moov", 32)]));
    expect(r.order).toEqual(["ftyp", "mdat", "moov"]);
    expect(r.faststart).toBe(false);
    expect(r.moovIndex).toBeGreaterThan(r.mdatIndex);
  });

  it("faststart:moov 在 mdat 之前", () => {
    const r = parseTopLevelAtoms(file([box("ftyp", 16), box("moov", 32), box("mdat", 64)]));
    expect(r.order).toEqual(["ftyp", "moov", "mdat"]);
    expect(r.faststart).toBe(true);
    expect(r.moovIndex).toBeLessThan(r.mdatIndex);
  });

  it("處理 64-bit largesize box(size==1)", () => {
    const total = 24;
    const big = new Uint8Array(total);
    const dv = new DataView(big.buffer);
    dv.setUint32(0, 1); // size==1 → 用 64-bit largesize
    "mdat".split("").forEach((c, i) => (big[4 + i] = c.charCodeAt(0)));
    dv.setUint32(8, 0); // largesize high
    dv.setUint32(12, total); // largesize low = 24
    const r = parseTopLevelAtoms(file([box("ftyp", 16), big]));
    expect(r.order).toEqual(["ftyp", "mdat"]);
    expect(r.atoms[1].size).toBe(24);
  });

  it("壞掉的 box(size<8)會安全停止", () => {
    const r = parseTopLevelAtoms(file([box("ftyp", 16)]).slice(0, 20)); // 截斷
    expect(r.atoms.length).toBeGreaterThanOrEqual(1);
  });
});
