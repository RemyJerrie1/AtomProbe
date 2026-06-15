// Parse the top-level mp4 atom (box) order and decide whether the file is faststart.
// An mp4 is a flat list of top-level boxes; each box header = size (4 bytes, big-endian) + type (4 ASCII bytes).
// size==1 → real size is the following 64-bit largesize; size==0 → box extends to end of file.
// We only read headers and jump by size to the next box, so the whole file is never loaded — just the headers.

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
  /** moov before mdat = already faststart */
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
    const type = String.fromCharCode(
      bytes[off + 4],
      bytes[off + 5],
      bytes[off + 6],
      bytes[off + 7]
    );

    if (size === 1) {
      // 64-bit largesize: 8 bytes right after the type field
      if (off + 16 > buf.byteLength) break;
      const high = view.getUint32(off + 8);
      const low = view.getUint32(off + 12);
      size = high * 2 ** 32 + low;
    } else if (size === 0) {
      // box extends to end of file
      size = buf.byteLength - off;
    }

    if (size < 8) break; // broken / illegal box — stop
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
