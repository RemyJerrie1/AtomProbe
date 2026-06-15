// 解析 mp4 頂層 atom(box)順序,判斷 faststart。
// mp4 = 一串頂層 box,每個 box header = size(4 bytes, big-endian) + type(4 bytes ASCII)。
// size==1 → 用後續 64-bit 大小;size==0 → 延伸到檔尾。
// 只讀 header、用 size 跳到下一個 box,所以**不需要載入整支檔**(只要前面 + 各 header)。

export interface Atom {
  type: string;
  size: number;
  offset: number;
}

export interface AtomReport {
  atoms: Atom[];
  order: string[];
  moovIndex: number;
  mdatIndex: number;
  /** moov 在 mdat 之前 = 已 faststart */
  faststart: boolean;
  moovOffset: number;
  fileSize: number;
}

export function parseTopLevelAtoms(buf: ArrayBuffer): AtomReport {
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  const atoms: Atom[] = [];
  let off = 0;

  while (off + 8 <= buf.byteLength) {
    let size = view.getUint32(off); // big-endian
    const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7]);

    if (size === 1) {
      // 64-bit 大小(largesize),在 type 之後 8 bytes
      if (off + 16 > buf.byteLength) break;
      const high = view.getUint32(off + 8);
      const low = view.getUint32(off + 12);
      size = high * 2 ** 32 + low;
    } else if (size === 0) {
      // 延伸到檔尾
      size = buf.byteLength - off;
    }

    if (size < 8) break; // 壞掉或非法 box,停止
    atoms.push({ type, size, offset: off });
    off += size;
  }

  const order = atoms.map((a) => a.type);
  const moovIndex = atoms.findIndex((a) => a.type === "moov");
  const mdatIndex = atoms.findIndex((a) => a.type === "mdat");
  const moov = atoms.find((a) => a.type === "moov");
  const faststart = moovIndex !== -1 && mdatIndex !== -1 && moovIndex < mdatIndex;

  return {
    atoms,
    order,
    moovIndex,
    mdatIndex,
    faststart,
    moovOffset: moov?.offset ?? -1,
    fileSize: buf.byteLength,
  };
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}
