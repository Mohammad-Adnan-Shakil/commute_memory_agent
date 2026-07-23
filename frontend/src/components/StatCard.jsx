import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

function AnimatedNumber({ value, duration = 600 }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === "--" || value == null) {
      setDisplayed(0);
      return;
    }
    const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
    if (isNaN(num)) { setDisplayed(0); return; }

    const startTime = Date.now();
    let raf;

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * num));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  if (value === "--" || value == null) return <>{value}</>;
  return <>{displayed}</>;
}

const accentMap = {
  teal: "text-teal-400 bg-teal-400/10 ring-teal-400/20",
  amber: "text-amber-400 bg-amber-400/10 ring-amber-400/20",
  sky: "text-sky-400 bg-sky-400/10 ring-sky-400/20",
  rose: "text-rose-400 bg-rose-400/10 ring-rose-400/20",
  emerald: "text-emerald-400 bg-emerald-400/10 ring-emerald-400/20",
};

export default function StatCard({ icon, label, value, sub, accent = "teal", delay = 0, tooltip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:border-white/[0.15] hover:bg-white/[0.04]"
      title={tooltip}
    >
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl ring-1", accentMap[accent])}>
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-[family-name:var(--font-heading)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        <AnimatedNumber value={value} />{value !== "--" && value != null && label === "Distance" ? " km" : ""}
        {value !== "--" && value != null && (label === "Duration" || label === "ETA") ? " min" : ""}
      </p>
      {sub && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
          {sub}
          {label === "ETA" && (
            <svg className="h-3 w-3 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
          )}
        </p>
      )}
    </motion.div>
  );
}
