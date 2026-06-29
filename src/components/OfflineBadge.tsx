import { useEffect, useState } from "react";
import type { Lang } from "../lib/i18n";

interface OfflineBadgeProps {
  lang: Lang;
  /** Demo override — leave undefined in production. */
  forceOffline?: boolean;
}

const AMBER = "#fbbf24";

export function OfflineBadge({ lang, forceOffline }: OfflineBadgeProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (forceOffline !== undefined) return;
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("offline", update);
    window.addEventListener("online", update);
    return () => {
      window.removeEventListener("offline", update);
      window.removeEventListener("online", update);
    };
  }, [forceOffline]);

  if (!(forceOffline ?? isOffline)) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "4px",
        background: "rgba(251,191,36,.07)",
        border: "1px solid rgba(251,191,36,.2)",
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: "11px",
        color: AMBER,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "9999px",
          background: AMBER,
          boxShadow: `0 0 5px ${AMBER}`,
        }}
      />
      {lang === "en" ? "⚡ Offline" : "⚡ 離線模式"}
    </span>
  );
}
