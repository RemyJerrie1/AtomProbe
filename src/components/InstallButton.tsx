import { useEffect, useState } from "react";
import type { Lang } from "../lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallButtonProps {
  lang: Lang;
  /** Demo override — leave undefined in production. */
  forceVisible?: boolean;
}

export function InstallButton({ lang, forceVisible }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (forceVisible !== undefined) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [forceVisible]);

  const handleClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  const visible =
    forceVisible !== undefined
      ? forceVisible
      : deferredPrompt !== null &&
        !window.matchMedia("(display-mode: standalone)").matches &&
        typeof (window as Window & { __TAURI__?: unknown }).__TAURI__ === "undefined";

  if (!visible) return null;

  return (
    <button
      type="button"
      className="install-btn"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: "11px",
        color: hovered ? "var(--text)" : "var(--muted)",
        border: `1px solid ${hovered ? "var(--muted)" : "var(--border)"}`,
        borderRadius: "4px",
        padding: "4px 10px",
        background: "transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "color .15s ease, border-color .15s ease",
        marginTop: 0,
        boxShadow: "none",
        fontWeight: "normal",
      }}
    >
      {lang === "en" ? "⬇ Install" : "⬇ 安裝"}
    </button>
  );
}
