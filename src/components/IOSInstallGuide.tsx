import { BadgeCheck, Share, SquarePlus } from "lucide-react";
import { useEffect, useRef } from "react";

// const isIOS =
//   /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

interface IOSInstallGuideProps {
  appName?: string;
  appIcon?: string;
  open: boolean;
  onClose: () => void;
}

export function IOSInstallGuide({
  appName = "App",
  appIcon,
  open,
  onClose,
}: IOSInstallGuideProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = () => onClose();
    dialog.addEventListener("cancel", handler);
    return () => dialog.removeEventListener("cancel", handler);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const outside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (outside) onClose();
  }

  return (
    <>
      <style>{`
        dialog.ios-dialog { padding: 0; border: none; outline: none; background: transparent; }
        dialog.ios-dialog::backdrop { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        @keyframes ios-in { from { opacity:0; transform: scale(0.95) translateY(6px); } to { opacity:1; transform: scale(1) translateY(0); } }
        dialog.ios-dialog[open] > div { animation: ios-in 0.2s ease; }
      `}</style>

      <dialog
        ref={dialogRef}
        className="ios-dialog "
        onClick={handleBackdropClick}
        aria-labelledby="ios-title"
        aria-describedby="ios-desc"
      >
        <div className="  rounded-2xl bg-white  shadow-2xl overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-3.5 p-6 pb-5">
            {appIcon ? (
              <img
                src={appIcon}
                alt="gradmanager"
                className="size-16 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-13 h-13 rounded-xl shrink-0 bg-zinc-100  flex items-center justify-center text-2xl font-medium text-zinc-500 ">
                {appName[0]}
              </div>
            )}
            <div className="flex-1 text-left pt-0.5">
              <p
                id="ios-title"
                className="text-[17px] font-semibold text-zinc-900  leading-snug"
              >
                Install {appName}
              </p>
              <p
                id="ios-desc"
                className="text-[13px] text-zinc-400 mt-1 leading-snug"
              >
                Add to your home screen for the best experience
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-zinc-100  hover:bg-zinc-200  text-zinc-500  flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* divider */}
          <div className="h-px bg-zinc-100  mx-6" />

          {/* steps */}
          <ol className="flex flex-col gap-4 px-6 py-5 list-none">
            <Step
              number={1}
              icon={<Share />}
              text={
                <>
                  Tap the{" "}
                  <strong className="font-semibold text-zinc-900 ">
                    Share
                  </strong>{" "}
                  button at the bottom of Safari
                </>
              }
            />
            <Step
              number={2}
              icon={<SquarePlus />}
              text={
                <>
                  Scroll and tap{" "}
                  <strong className="font-semibold text-zinc-900 ">
                    Add to Home Screen
                  </strong>
                </>
              }
            />
            <Step
              number={3}
              icon={<BadgeCheck />}
              text={
                <>
                  Tap{" "}
                  <strong className="font-semibold text-zinc-900 ">Add</strong>{" "}
                  in the top-right corner
                </>
              }
            />
          </ol>

          {/* divider */}
          <div className="h-px bg-zinc-100  mx-6" />

          {/* perks */}
          <div className="flex justify-center gap-4 px-6 pt-4 pb-1">
            {["Works offline", "Faster loads", "No App Store"].map((perk) => (
              <span
                key={perk}
                className="flex items-center gap-1 text-[12px] text-zinc-300 "
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {perk}
              </span>
            ))}
          </div>

          {/* dismiss */}
          <div className="p-6 pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-zinc-200  text-[15px] font-medium text-zinc-500  hover:bg-zinc-50  active:scale-[0.98] transition-all"
            >
              Maybe later
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Step({
  number,
  icon,
  text,
}: {
  number: number;
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-zinc-100  flex items-center justify-center text-[12px] font-semibold text-zinc-500 ">
        {number}
      </div>
      <div className="shrink-0 w-10 h-10 rounded-[10px] bg-zinc-100  flex items-center justify-center text-zinc-500 ">
        {icon}
      </div>
      <p className="flex-1 text-[14px] text-left text-zinc-600  leading-snug">
        {text}
      </p>
    </li>
  );
}
