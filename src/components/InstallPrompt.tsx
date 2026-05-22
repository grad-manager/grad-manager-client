import { useEffect, useState } from "react";
import AddToMobileChrome from "./AddToMobileChrome";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { BeforeInstallPromptEvent } from "../types/BeforeInstallPrompt";
import { useLocation } from "react-router-dom";

export default function InstallPrompt({
  promptEvent,
}: {
  promptEvent: BeforeInstallPromptEvent | null;
}) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>();
  const pathname = useLocation().pathname;

  useEffect(() => {
    setEvent(promptEvent);
  }, [promptEvent]);

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

  return (
    <AnimatePresence>
      {event !== null && pathname === "/" && (
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
