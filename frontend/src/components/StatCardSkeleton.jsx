import { motion } from "framer-motion";

export default function StatCardSkeleton({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm"
    >
      <div className="mb-3 h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-2 h-7 w-20 rounded bg-white/[0.06] bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] animate-shimmer" />
      <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
    </motion.div>
  );
}
