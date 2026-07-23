import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-5 flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-xs text-neutral-400 backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
        </span>
        Live Agent &middot; Bengaluru Transit Network
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl text-balance text-4xl font-medium tracking-tighter sm:text-5xl md:text-6xl font-[family-name:var(--font-heading)]"
      >
        Commute Memory{" "}
        <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-teal-400 bg-clip-text text-transparent">
          Agent
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
        className="mt-4 max-w-lg text-balance text-sm text-neutral-400 sm:text-base"
      >
        An AI transit companion that remembers your routes, preferences, and traffic
        patterns across Bengaluru &mdash; so every answer gets sharper over time.
      </motion.p>
    </motion.div>
  );
}
