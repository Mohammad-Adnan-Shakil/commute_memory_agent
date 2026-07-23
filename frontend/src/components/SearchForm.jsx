import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Route, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import TypingDots from "./TypingDots";

const SUGGESTIONS = [
  "What's the traffic like from Silk Board to ORR at 8:45 AM?",
  "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?",
  "What's the route from Jayanagar to Koramangala at 9 AM?",
  "Compare leaving Hebbal at 6 PM vs 8 PM",
];

export default function SearchForm({ query, setQuery, onSubmit, isThinking, isFocused, setIsFocused, inputRef }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasInteracted(true);
    onSubmit();
  };

  const handleSuggestion = (s) => {
    setHasInteracted(true);
    setQuery(s);
    onSubmit(s);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value) setHasInteracted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="mt-10 w-full"
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={cn(
            "relative flex items-center gap-2 rounded-2xl border bg-white/[0.03] p-2 pl-4 backdrop-blur-xl transition-all duration-300",
            isFocused
              ? "border-teal-400/50 shadow-[0_0_0_1px_rgba(45,212,191,0.3),0_0_40px_-8px_rgba(45,212,191,0.5)]"
              : "border-white/[0.08]"
          )}
        >
          <Route className="h-4 w-4 shrink-0 text-teal-400 transition-transform duration-300" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask a route, e.g. route from Koramangala to Indiranagar"
            className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            aria-label="Ask about a commute route"
          />
          <Button
            type="submit"
            disabled={isThinking || !query.trim()}
            className={cn(
              "h-9 shrink-0 gap-1.5 rounded-xl px-4 text-sm transition-all active:scale-[0.95]",
              query.trim()
                ? "bg-teal-400 text-black hover:bg-teal-300"
                : "bg-white/[0.06] text-neutral-500"
            )}
            aria-label={isThinking ? "Analyzing..." : "Ask route"}
          >
            {isThinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isThinking ? "Thinking" : "Ask"}</span>
          </Button>
        </div>
      </form>

      <AnimatePresence>
        {!hasInteracted && !isThinking && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mt-5 mb-2 text-[11px] uppercase tracking-wider text-neutral-600 font-[family-name:var(--font-heading)]">
              Try asking
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-teal-400/30 hover:text-teal-300"
                  aria-label={`Try: ${s}`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-3"
          >
            <Sparkles className="h-4 w-4 text-teal-400 shrink-0" />
            <TypingDots />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
