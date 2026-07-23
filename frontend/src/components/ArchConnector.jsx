import { motion } from "framer-motion";

export default function ArchConnector({ delay = 0 }) {
  return (
    <div className="relative mx-2 h-px flex-1 self-center overflow-hidden bg-white/[0.08] sm:mx-4 md:mx-6">
      <motion.div
        className="absolute top-0 h-px w-16 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay }}
      />
    </div>
  );
}
