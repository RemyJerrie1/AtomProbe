// Minimal hand-rolled i18n — deliberately no library.
// For a 2-language micro-tool, a typed dictionary + one useState beats pulling in
// i18next (~40KB+) and its async loader. The shape below (flat keys, a single t())
// is intentionally i18next-compatible, so swapping in a library later is mechanical.
import { useState, useCallback } from "react";

export type Lang = "en" | "zh";

// Keep the two columns the SAME shape — a missing key in one language is the #1 source
// of runtime "undefined" text, so we let TypeScript enforce parity via `satisfies`.
const dict = {
  en: {
    tagline: "Inspect mp4 atoms, check faststart, and re-mux +faststart — all in your browser.",
    privacy: "Runs entirely in your browser. Your file is never uploaded.",
    drop: "Choose / drop an .mp4",
    parseError: "Could not parse this file — make sure it's an mp4.",
    faststartOk:
      "✓ Faststart — moov precedes mdat; plays while downloading (progressive streaming)",
    faststartBad: "✗ Not faststart — moov trails mdat; playback must wait for a full download",
    faststartFrag: "ℹ️ Fragmented mp4 (fMP4) — stream-ready by design",
    fragNote:
      "Each fragment embeds its own index (moof), so a fragmented mp4 supports progressive streaming as-is. +faststart applies only to non-fragmented files (single moov).",
    remuxNA: "+faststart does not apply to fragmented mp4.",
    coreLoadFail:
      "Couldn't load the ffmpeg core (CDN fetch failed). Check your network and try again.",
    topOrder: "Top-level order:",
    moovPos: "moov position: offset",
    inFront: "(at front)",
    inBack: "(at back)",
    btnReady: "Add +faststart & download",
    btnRemux: "Re-mux again (+faststart)",
    btnBusy: "Working…",
    logLoad: "Loading ffmpeg…",
    logDone: "Done — faststart version downloaded.",
    remuxFail: "Re-mux failed: ",
    footer:
      "How it works: moov is the index a player needs to demux. Moved to the front, the player learns every frame's byte offset from the first few KB and uses HTTP Range Requests to stream only what it plays. -c copy means no re-encode and no quality loss.",
  },
  zh: {
    tagline: "解析 mp4 atom、判斷 faststart、一鍵 re-mux +faststart——全程在你的瀏覽器。",
    privacy: "全程在你的瀏覽器執行,檔案不會上傳。",
    drop: "選擇 / 拖入 .mp4",
    parseError: "無法解析這個檔案,請確認是 mp4。",
    faststartOk: "✓ 已 faststart — moov 在 mdat 之前,可邊下載邊播放(漸進式串流)",
    faststartBad: "✗ 未 faststart — moov 在 mdat 之後,須完整下載後才能播放",
    faststartFrag: "ℹ️ 分段式 mp4(fMP4)— 結構上原生支援串流",
    fragNote:
      "分段式 mp4 的每個 fragment 內含自身索引(moof),本身即支援漸進式串流;+faststart 僅適用於非分段(單一 moov)的檔案。",
    remuxNA: "+faststart 不適用於分段式 mp4。",
    coreLoadFail: "無法載入 ffmpeg core(CDN 連線失敗),請檢查網路後重試。",
    topOrder: "頂層順序:",
    moovPos: "moov 位置:offset",
    inFront: "(在前)",
    inBack: "(在後)",
    btnReady: "一鍵加 +faststart 並下載",
    btnRemux: "重新 re-mux(+faststart)",
    btnBusy: "處理中…",
    logLoad: "載入 ffmpeg…",
    logDone: "完成!已下載 faststart 版本。",
    remuxFail: "re-mux 失敗:",
    footer:
      "原理:moov 是解封裝必需的索引。搬到檔頭後,播放器從前幾 KB 就知道每個 frame 的 byte 位置,用 HTTP Range Request 只抓要播的片段、邊載邊播。-c copy 不重編、不損畫質。",
  },
} satisfies Record<Lang, Record<string, string>>;

export type TKey = keyof (typeof dict)["en"];

export function useI18n(initial: Lang = "en") {
  const [lang, setLang] = useState<Lang>(initial);
  const t = useCallback((key: TKey) => dict[lang][key], [lang]);
  const toggle = useCallback(() => setLang((l) => (l === "en" ? "zh" : "en")), []);
  return { lang, setLang, toggle, t };
}
