// ffmpeg.wasm 單例:懶載 + in-flight 去重,失敗清掉可重試。
// 用「單執行緒」core(只給 coreURL/wasmURL,不給 workerURL)→ 不需要 SharedArrayBuffer + COOP/COEP,
// 因此可純靜態部署、不必處理跨來源隔離。單檔 re-mux(-c copy)很快,單執行緒夠用。
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// 起手用 CDN 取 core(最快開始);上線/離線可改成自託管到 public/ 並改這裡。
const CORE_BASE = "https://unpkg.com/@ffmpeg/[email protected]/dist/umd";

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;
let logCb: ((message: string) => void) | null = null;

/** 設定 ffmpeg log 回呼(註冊一次,避免每次 exec 疊加 listener)。 */
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
    loading = null; // 失敗清掉,下次可重試
    throw err;
  });
  return loading;
}

/**
 * 把 mp4 重組成 faststart(moov 搬到檔頭)。
 * -c copy = 不重編,只搬 moov → 快、不損畫質、不吃 CPU。內容(音視訊)完全不變。
 */
export async function addFaststart(file: File): Promise<Blob> {
  const ff = await getFFmpeg();
  await ff.writeFile("in.mp4", await fetchFile(file));
  await ff.exec(["-i", "in.mp4", "-c", "copy", "-movflags", "+faststart", "out.mp4"]);
  const data = await ff.readFile("out.mp4");
  // 釋放 MEMFS,避免長 session 累積
  await ff.deleteFile("in.mp4");
  await ff.deleteFile("out.mp4");
  return new Blob([data as BlobPart], { type: "video/mp4" });
}
