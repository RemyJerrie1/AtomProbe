# 🔬 Atomscope

> Visualize an mp4's top-level **atom (box) order**, flag whether it's **faststart** (can stream / start playing instantly), and **one-click re-mux `+faststart`** — 100% in the browser, no upload.

線上 demo:_(部署後補)_ ｜ 截圖:_(補)_

## 這是什麼
丟一支 mp4 進來 → Atomscope 解析它的頂層 `ftyp / moov / mdat / free` 順序 → 告訴你 `moov` 索引在 `mdat` 前(✓ faststart,可串流秒起播)還是在後(✗,要先載到檔尾才起播)→ 按一鍵用 ffmpeg.wasm 把 `moov` 搬到檔頭、下載 faststart 版本。**檔案不上傳、不重編、不損畫質。**

## 🧭 設計取捨(為何這樣設計)
> 在 AI 時代,「為何這樣設計」比把它寫出來更值錢。這節是這個工具的核心判斷。

- **為何 Vite/React SPA,不用 Next.js**:Atomscope 是 **100% 客戶端**(atom 解析 + ffmpeg.wasm re-mux 全在瀏覽器、檔案不上傳)。Next 的價值是 SSR/SSG/RSC/server route/SEO——這裡**全用不到**(點按才用的工具,無 SEO、無 server 邏輯、不抓資料)。用 Next 只會多 server runtime 要部署維護 + hydration 成本,換不到好處;Vite SPA 更輕、純靜態上 CDN。**判準:沒有伺服器渲染 / SEO / server 邏輯需求 → 不選 Next。** 反例:若要做動態 OG meta 的分享頁,就該用 Nuxt/Next(因為那真的需要 SSR)。
- **為何單執行緒 ffmpeg.wasm**:多執行緒(WASM threads)要 `SharedArrayBuffer` + COOP/COEP 跨來源隔離,會讓靜態部署與第三方資源變複雜。單檔 `-c copy` re-mux 很快,單執行緒就夠。**否決多執行緒:這場景沒有重編 / 批次需求。**
- **為何 `-c copy` 不重編**:faststart 只是把 `moov` atom 搬到檔頭,不碰 codec → 快、**不損畫質**、不吃 CPU,內容(音視訊)位元組完全不變。
- **為何純前端、不上傳**:隱私(使用者媒體不外流)+ 零後端成本 + 即時回饋。**代價**:受瀏覽器記憶體上限,超大檔可能吃力 —— 這是取捨,不是 bug。
- **為何 core 先用 CDN**:起步最快;要離線 / 可控版本時改成自託管到 `public/`(見 `src/lib/ffmpeg.ts` 的 `CORE_BASE`)。

## 原理(faststart 為什麼能串流)
mp4 是一串頂層 box;`moov` 是解封裝必需的索引(軌道 / 時間軸 / 每個 frame 的 byte 位置)。`moov` 在檔頭時,播放器拿到前幾 KB 就知道所有位置 → 用 **HTTP Range Request(`GET bytes=x-y`)只抓要播的片段、邊載邊播**,不必下載整支。`moov` 在檔尾就沒這資訊,只能先把資料拉到接近尾端。

## 技術棧 / 怎麼跑
- Vite + React 19 + TypeScript + `@ffmpeg/ffmpeg`(單執行緒 WASM core)。
```bash
npm install
npm run dev      # 本機開發
npm run build    # 純靜態輸出到 dist/,可上任何 CDN
```

## 🔧 品質防線(專業基線,非玩具)
| 防線 | 工具 / 指令 |
|---|---|
| 型別 | TypeScript strict(`npm run build` 含 `tsc --noEmit`) |
| Lint | ESLint 9 flat config(`npm run lint`) |
| 格式 | Prettier(`npm run format` / `format:check`) |
| 單元測試 | Vitest + v8 coverage(`npm test` / `test:run`)— 涵蓋 atom 解析(faststart 判定、64-bit box) |
| **Git hooks** | husky:**pre-commit** 跑 lint-staged(eslint --fix + prettier)、**pre-push** 跑測試 |
| Bundle 指標 | `npm run metrics:size`(dist raw + gzip) |
| **Lighthouse** | `npm run metrics:lhci`(Perf/SEO/A11y ≥0.9 斷言) |
| CI | GitHub Actions:format → lint → test → build → size(每 push/PR) |

> 即使是小工具,也用**和正式產品同一套品質門檻**——這就是「精緻、不是玩具」。

## 限制 / 待辦
- 目前只解析**頂層** atom(不遞迴 box 樹)、只支援 mp4。
- 大檔受瀏覽器記憶體限制。
- 之後可加:WebCodecs、Worker offload、多檔批次、box 樹深度檢視。
