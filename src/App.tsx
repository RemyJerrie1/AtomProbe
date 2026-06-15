import { useState, useEffect } from "react";
import { parseTopLevelAtoms, humanSize, type AtomReport } from "./lib/atoms";
import { addFaststart, setFfmpegLog } from "./lib/ffmpeg";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<AtomReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFfmpegLog((m) => setLog(m));
  }, []);

  async function onFile(f: File) {
    setError("");
    setReport(null);
    setLog("");
    setFile(f);
    try {
      const buf = await f.arrayBuffer();
      setReport(parseTopLevelAtoms(buf));
    } catch {
      setError("無法解析這個檔案,請確認是 mp4。");
    }
  }

  async function remux() {
    if (!file) return;
    setBusy(true);
    setError("");
    setLog("載入 ffmpeg…");
    try {
      const blob = await addFaststart(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.mp4$/i, "") + ".faststart.mp4";
      a.click();
      URL.revokeObjectURL(url);
      setLog("完成!已下載 faststart 版本。");
    } catch (e) {
      setError("re-mux 失敗:" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <header>
        <h1>🔬 Atomscope</h1>
        <p className="sub">
          上傳 mp4 → 看 atom 順序、判斷能不能<strong>串流秒起播</strong>、一鍵加 <code>+faststart</code>。
          <br />
          <span className="muted">全程在你的瀏覽器跑,檔案不上傳。</span>
        </p>
      </header>

      <label className="drop">
        <input
          type="file"
          accept="video/mp4,.mp4"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <span>{file ? file.name : "選擇 / 拖入 .mp4"}</span>
      </label>

      {error && <p className="error">{error}</p>}

      {report && (
        <section className="report">
          <div className={`badge ${report.faststart ? "ok" : "bad"}`}>
            {report.faststart ? "✓ 已 faststart(可串流秒起播)" : "✗ 未 faststart(要先載到檔尾才起播)"}
          </div>

          <div className="atoms">
            {report.atoms.map((a, i) => (
              <span
                key={i}
                className={`atom ${a.type === "moov" ? "moov" : a.type === "mdat" ? "mdat" : ""}`}
                title={`${a.type} · ${humanSize(a.size)} @ offset ${a.offset}`}
              >
                {a.type}
              </span>
            ))}
          </div>

          <p className="meta">
            頂層順序:<code>{report.order.join(" → ")}</code>
            <br />
            moov 位置:offset <code>{report.moovOffset}</code> / {humanSize(report.fileSize)}
            {report.faststart ? "(在前)" : "(在後)"}
          </p>

          <button onClick={remux} disabled={busy}>
            {busy ? "處理中…" : report.faststart ? "重新 re-mux(+faststart)" : "一鍵加 +faststart 並下載"}
          </button>
          {log && <pre className="log">{log}</pre>}
        </section>
      )}

      <footer className="muted">
        原理:moov 是解封裝必需的索引,搬到檔頭 → 播放器拿到前幾 KB 就知道每個 frame 的 byte 位置 →
        用 HTTP Range Request 只抓要播的片段、邊載邊播。<code>-c copy</code> 不重編、不損畫質。
      </footer>
    </main>
  );
}
