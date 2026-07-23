import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import BackgroundFX from "./BackgroundFX";
import Logo from "./Logo";
import HeroSection from "./HeroSection";
import SearchForm from "./SearchForm";
import StatCardSkeleton from "./StatCardSkeleton";
import ResultCard from "./ResultCard";
import SessionHistory from "./SessionHistory";
import ArchitectureFlow from "./ArchitectureFlow";
import { findMatchingQuery } from "../hooks/useMemoryRecall";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

function parseQuery(raw) {
  const cleaned = raw.trim().replace(/^route (from )?/i, "");
  const match = cleaned.match(/(?:from\s+)?(.+?)\s+to\s+(.+)/i);
  if (match) {
    return { from: match[1].trim(), to: match[2].trim() };
  }
  return { from: "Current location", to: cleaned || "Destination" };
}

function mapCongestionLevel(level) {
  if (!level) return "Moderate";
  const upper = level.toUpperCase();
  if (upper === "HIGH") return "Heavy";
  if (upper === "MEDIUM" || upper === "MODERATE") return "Moderate";
  return "Low";
}

function detectCorridor(text) {
  const lower = text.toLowerCase();
  if (lower.includes("silk board") || lower.includes("outer ring road") || lower.includes("silk board–orr")) return "silk_board_orr";
  if (lower.includes("whitefield") || lower.includes("marathahalli")) return "whitefield_stretch";
  if (lower.includes("hebbal")) return "hebbal";
  if (lower.includes("electronic city") || lower.includes("hosur road")) return "electronic_city";
  return null;
}

export default function CommuteMemoryAgent() {
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const lastQueryRef = useRef("");

  const runQuery = useCallback(async (raw) => {
    if (!raw.trim() || isThinking) return;
    setIsThinking(true);
    setResult(null);
    setError(null);
    lastQueryRef.current = raw;

    const currentMemoryMatch = findMatchingQuery(raw);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: raw, session_id: sessionId }),
      });
      const data = await res.json();
      setSessionId(data.session_id);

      const { from, to } = parseQuery(raw);
      const distanceKm = data.distance_km;
      const durationMin = data.duration_min;
      const congestion = mapCongestionLevel(data.congestion_level);
      const etaMin = durationMin ? durationMin + 3 : null;

      const newResult = {
        id: `${Date.now()}`,
        from,
        to,
        recalled: !!currentMemoryMatch,
        memoryNote: currentMemoryMatch ? currentMemoryMatch.preference_text : undefined,
        stats: {
          distanceKm: distanceKm != null ? String(distanceKm) : "--",
          durationMin: durationMin != null ? durationMin : "--",
          congestion,
          etaMin: etaMin != null ? etaMin : "--",
        },
        routeCoordinates: data.route_coordinates || null,
        congestionLevel: data.congestion_level || null,
        bottleneckIndices: data.bottleneck_segment_indices || null,
        corridor: detectCorridor(raw),
        createdAt: Date.now(),
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsThinking(false);
    }
  }, [isThinking, sessionId]);

  const handleSubmit = useCallback((queryOverride) => {
    const raw = queryOverride != null ? queryOverride : query;
    if (queryOverride == null) {
      setQuery("");
    }
    runQuery(raw);
  }, [query, runQuery]);

  const handleHistorySelect = (h, clear) => {
    if (clear) {
      setHistory([]);
      return;
    }
    setResult(h);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleRetry = () => {
    if (lastQueryRef.current) {
      runQuery(lastQueryRef.current);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060911] text-white">
      <BackgroundFX />

      <div className="relative z-10 mx-auto flex max-w-4xl items-center px-6 pt-4">
        <Logo />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-12 pb-10">
        <HeroSection />

        <SearchForm
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          isThinking={isThinking}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          inputRef={inputRef}
        />

        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-10 w-full"
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCardSkeleton delay={0.05} />
                <StatCardSkeleton delay={0.1} />
                <StatCardSkeleton delay={0.15} />
                <StatCardSkeleton delay={0.2} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-8 flex w-full items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"
              role="alert"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="flex-1">{error}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-xs text-rose-300/70 hover:text-rose-200 transition-colors"
                  aria-label="Retry query"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  onClick={handleDismissError}
                  className="text-rose-300/50 hover:text-rose-200 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result && !isThinking && (
            <ResultCard key={result.id} result={result} />
          )}
        </AnimatePresence>

        <SessionHistory
          history={history}
          activeId={result?.id}
          onSelect={handleHistorySelect}
        />
      </div>

      <ArchitectureFlow />
    </div>
  );
}
