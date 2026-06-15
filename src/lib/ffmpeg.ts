// ffmpeg.wasm singleton: lazy-load + in-flight dedup; cleared on failure so it can be retried.
// Uses the single-thread core (only coreURL/wasmURL, no workerURL) → no SharedArrayBuffer + COOP/COEP needed,
// so it can be deployed as pure static files with no cross-origin isolation. A single -c copy re-mux is fast enough single-threaded.
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Pull the core from a CDN for the fastest cold start; for prod/offline, self-host into public/ and change this.
const CORE_BASE = "https://unpkg.com/@ffmpeg/[email protected]/dist/umd";

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;
let logCb: ((message: string) => void) | null = null;

/** Set the ffmpeg log callback (registered once, so listeners don't stack up per exec). */
export function setFfmpegLog(cb: (message: string) => void): void {
  logCb = cb;
}

async function getFFmpeg(): Promise<FFmpeg> {
  if (instance) return instance;
  if (loading) return loading;
  loading = (async () => {
    const ff = new FFmpeg();
    ff.on("log", ({ message }) => logCb?.(message));
    await ff.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
    instance = ff;
    return ff;
  })().catch((err) => {
    loading = null; // clear on failure so the next call can retry
    throw err;
  });
  return loading;
}

/**
 * Re-mux an mp4 into faststart (moov moved to the front).
 * -c copy = no re-encode, only relocates moov → fast, lossless, low CPU. The audio/video bitstream is untouched.
 */
export async function addFaststart(file: File): Promise<Blob> {
  const ff = await getFFmpeg();
  await ff.writeFile("in.mp4", await fetchFile(file));
  await ff.exec(["-i", "in.mp4", "-c", "copy", "-movflags", "+faststart", "out.mp4"]);
  const data = await ff.readFile("out.mp4");
  // free MEMFS so files don't accumulate over a long session
  await ff.deleteFile("in.mp4");
  await ff.deleteFile("out.mp4");
  return new Blob([data as BlobPart], { type: "video/mp4" });
}
