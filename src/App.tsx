import { useState, useEffect } from "react";
import { parseTopLevelAtoms, humanSize, type AtomReport } from "./lib/atoms";
import { addFaststart, setFfmpegLog } from "./lib/ffmpeg";
import { useI18n } from "./lib/i18n";

export default function App() {
  const { lang, toggle, t } = useI18n("en");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<AtomReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFfmpegLog((m) => setLog(m));
  }, []);

  // Reflect language on <html> so the browser picks correct line-breaking + font fallback (CJK vs Latin).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  async function onFile(f: File) {
    setError("");
    setReport(null);
    setLog("");
    setFile(f);
    try {
      const buf = await f.arrayBuffer();
      setReport(parseTopLevelAtoms(buf));
    } catch {
      setError(t("parseError"));
    }
  }

  async function remux() {
    if (!file) return;
    setBusy(true);
    setError("");
    setLog(t("logLoad"));
    try {
      const blob = await addFaststart(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.mp4$/i, "") + ".faststart.mp4";
      a.click();
      URL.revokeObjectURL(url);
      setLog(t("logDone"));
    } catch (e) {
      setError(t("remuxFail") + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <header>
        <div className="topbar">
          <h1>🔬 Atomscope</h1>
          <button className="lang" onClick={toggle} aria-label="Switch language">
            {lang === "en" ? "中文" : "EN"}
          </button>
        </div>
        <p className="sub">
          {t("tagline")}
          <br />
          <span className="muted">{t("privacy")}</span>
        </p>
      </header>

      <label className="drop">
        <input
          type="file"
          accept="video/mp4,.mp4"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <span>{file ? file.name : t("drop")}</span>
      </label>

      {error && <p className="error">{error}</p>}

      {report && (
        <section className="report">
          <div className={`badge ${report.faststart ? "ok" : "bad"}`}>
            {report.faststart ? t("faststartOk") : t("faststartBad")}
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
            {t("topOrder")} <code>{report.order.join(" → ")}</code>
            <br />
            {t("moovPos")} <code>{report.moovOffset}</code> / {humanSize(report.fileSize)}{" "}
            {report.faststart ? t("inFront") : t("inBack")}
          </p>

          <button onClick={remux} disabled={busy}>
            {busy ? t("btnBusy") : report.faststart ? t("btnRemux") : t("btnReady")}
          </button>
          {log && <pre className="log">{log}</pre>}
        </section>
      )}

      <footer className="muted">{t("footer")}</footer>
    </main>
  );
}
