// hooks/usePWAInstall.ts
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  //   const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detects if already running as installed PWA
    // const isStandalone =
    //   window.matchMedia("(display-mode: standalone)").matches ||
    //   (navigator as any).standalone === true; // iOS

    // if (isStandalone) {
    //   setIsInstalled(true);
    //   return; // don't bother listening for the prompt
    // }

    const handler = (e: Event) => {
      e.preventDefault(); // stop browser's default mini-bar
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    // Fires when PWA is successfully installed
    // window.addEventListener("appinstalled", () => setIsInstalled(true));
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstallEvent(null);
  };

  return { canInstall: !!installEvent, triggerInstall };
}
