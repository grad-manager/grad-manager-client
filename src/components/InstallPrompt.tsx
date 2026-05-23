import AddToMobileChrome from "./AddToMobileChrome";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useInstallPWA } from "../hooks/useInstallPWA";

export default function InstallPrompt() {
  const { isStandalone, event, pathname, handleInstallClick, closePrompt } =
    useInstallPWA();
  console.log(event, isStandalone, pathname);

  // Only Show Install prompt when event is defined, standalone is false and pathname is /
  return (
    <AnimatePresence>
      {event !== null && !isStandalone && pathname === "/" && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "tween" }}
          className="fixed top-0 right-0 bottom-0 left-0 z-50 flex justify-center bg-black/70"
          onClick={closePrompt}
        >
          <X className="text-white absolute top-5 size-7 right-5" />
          <AddToMobileChrome handleInstallClick={handleInstallClick} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
