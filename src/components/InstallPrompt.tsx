import { useState } from "react";
import AddToMobileChrome from "./AddToMobileChrome";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { BeforeInstallPromptEvent } from "../types/BeforeInstallPrompt";
import { useLocation } from "react-router-dom";

export default function InstallPrompt() {
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
    if (!event) return;
    await event.prompt();

    const { outcome } = await (event as any).userChoice;
    outcome !== "dismissed" && closePrompt();
    console.log("User choice:", outcome);
  }

  // Only Show Install prompt when event is defined, standalone is false and pathname is /
  return (
    <AnimatePresence>
      {event !== null && !isStandalone && pathname === "/" && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "tween" }}
          className="fixed top-0 right-0 bottom-0 left-0 z-50 flex justify-center bg-black/40"
          onClick={closePrompt}
        >
          <X className="text-white absolute top-5 size-7 right-5" />
          <AddToMobileChrome handleInstallClick={handleInstallClick} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
