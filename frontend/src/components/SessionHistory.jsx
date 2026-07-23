import { motion } from "framer-motion";
import { History, ArrowRight, Clock } from "lucide-react";
import { cn } from "../lib/utils";

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SessionHistory({ history, activeId, onSelect }) {
  if (!history || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-10 w-full"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 font-[family-name:var(--font-heading)]">
          <History className="h-3.5 w-3.5" /> Session memory
        </p>
        <button
          onClick={() => onSelect(null, true)}
          className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
          aria-label="Clear history"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((h) => (
          <button
            key={h.id}
            onClick={() => onSelect(h)}
            className={cn(
              "group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all",
              activeId === h.id
                ? "border-teal-400/30 bg-teal-400/10 text-teal-300"
                : h.recalled
                ? "border-amber-400/20 bg-amber-400/5 text-amber-300/80 hover:bg-amber-400/10"
                : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-teal-400/20 hover:text-teal-300"
            )}
            aria-label={`View result: ${h.from} to ${h.to}`}
          >
            <span className="font-medium">{h.from}</span>
            <ArrowRight className="h-3 w-3 opacity-50" />
            <span className="font-medium">{h.to}</span>
            {h.createdAt && (
              <span className="ml-1 text-[10px] text-neutral-600">{timeAgo(h.createdAt)}</span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
