import { useState } from "react";
import type { BeforeInstallPromptEvent } from "../types/BeforeInstallPrompt";
import { useLocation } from "react-router-dom";

export function useInstallPWA() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(
    () => (window as any).__installPrompt ?? null,
  );
  const pathname = useLocation().pathname;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;

  // Close Prompt
  const closePrompt = () => {
    setEvent(null);
  };

  async function handleInstallClick() {
    console.log(event);
    if (!event) return;
    await event.prompt();

    const { outcome } = await (event as any).userChoice;
    closePrompt();
    console.log("User choice:", outcome);
  }

  return { handleInstallClick, isStandalone, pathname, closePrompt, event };
}
