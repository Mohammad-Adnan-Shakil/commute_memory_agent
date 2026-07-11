import { useState } from "react";
import { History, X } from "lucide-react";
import useMemoryRecall from "../hooks/useMemoryRecall";

export default function PreviouslyAsked({ queryText }) {
  const match = useMemoryRecall(queryText);
  const [dismissed, setDismissed] = useState(false);

  if (!match || dismissed) return null;

  const date = new Date(match.created_at);
  const dateLabel = date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-[750px] px-4 pb-2">
      <div className="animate-fade-slide-up inline-flex items-start gap-2.5 bg-neutral-900/50 border border-neutral-800/30 rounded-xl px-3 py-2 max-w-full">
        <History size={13} className="text-amber-500/60 shrink-0 mt-0.5" />
        <p className="text-[11px] text-neutral-400 leading-relaxed flex-1 min-w-0">
          You asked about this route before —{" "}
          <span className="text-neutral-300 font-medium">
            {match.origin} → {match.destination}
          </span>
          . {match.preference_text}
          <span className="text-neutral-600 ml-1">({dateLabel})</span>
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 text-neutral-600 hover:text-neutral-400 transition-colors duration-150 mt-0.5"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
