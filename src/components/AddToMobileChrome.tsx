import { motion } from "framer-motion";

type Props = {
  handleInstallClick: () => void;
};

export default function AddToMobileChrome(props: Props) {
  const { handleInstallClick } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: "tween" }}
      exit={{ opacity: 0, y: 100 }}
      className="relative mx-2 my-9 flex lg:h-20 w-3/5 h-16 items-center justify-between lg:rounded-xl rounded-xl bg-white px-6 lg:w-2/4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center">
        <div className="relative flex items-center gap-1">
          <img
            alt="GradManager Logo"
            className="h-12 w-12"
            height={500}
            src="/gradManager-1.svg"
            width={500}
          />
          <h1 className="pt-1 font-semibold hidden lg:block text-2xl">
            Grad<span className="text-primary">Manager</span>
          </h1>
        </div>
      </div>
      <button
        className="lg:!p-6 mt-1 font-semibold bg-transparent hover:text-primary hover:transition-all hover:duration-300 text-sm capitalize lg:text-base"
        onClick={handleInstallClick}
      >
        install app
      </button>
    </motion.div>
  );
}
