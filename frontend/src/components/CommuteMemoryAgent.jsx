import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Clock,
  MapPin,
  Navigation,
  Gauge,
  Sparkles,
  History,
  Bot,
  Database,
  Network,
  Loader2,
  ArrowRight,
  Route,
  Zap,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { findMatchingQuery } from "../hooks/useMemoryRecall";
import RouteMap from "./RouteMap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const SUGGESTIONS = [
  "What's the traffic like from Silk Board to ORR at 8:45 AM?",
  "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?",
  "What's the route from Jayanagar to Koramangala at 9 AM?",
];

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

function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 -right-20 h-[380px] w-[380px] rounded-full bg-sky-500/10 blur-[120px] animate-pulse [animation-delay:1s]" />
      <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-amber-500/[0.06] blur-[110px] animate-pulse [animation-delay:2s]" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="network-lines" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 60 L40 20 L80 60 L120 30" fill="none" stroke="rgba(45,212,191,0.6)" strokeWidth="0.6" />
            <path d="M20 0 L50 40 L30 80 L60 120" fill="none" stroke="rgba(45,212,191,0.4)" strokeWidth="0.5" />
            <path d="M90 0 L70 50 L100 90 L80 120" fill="none" stroke="rgba(45,212,191,0.4)" strokeWidth="0.5" />
            <path d="M0 100 L40 80 L80 110 L120 90" fill="none" stroke="rgba(45,212,191,0.5)" strokeWidth="0.5" />
            <circle cx="40" cy="20" r="2" fill="rgba(45,212,191,0.7)" />
            <circle cx="80" cy="60" r="1.5" fill="rgba(45,212,191,0.5)" />
            <circle cx="50" cy="40" r="1.5" fill="rgba(45,212,191,0.6)" />
            <circle cx="30" cy="80" r="2" fill="rgba(45,212,191,0.5)" />
            <circle cx="70" cy="50" r="1.5" fill="rgba(45,212,191,0.6)" />
            <circle cx="100" cy="90" r="1.5" fill="rgba(45,212,191,0.5)" />
            <circle cx="40" cy="80" r="2" fill="rgba(45,212,191,0.6)" />
            <circle cx="80" cy="110" r="1.5" fill="rgba(45,212,191,0.5)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-lines)" />
      </svg>

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-px w-1/3 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
          style={{ top: `${20 + i * 28}%` }}
          initial={{ x: "-100%" }}
          animate={{ x: "220%" }}
          transition={{
            duration: 6 + i * 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1.2,
          }}
        />
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="h-1.5 w-1.5 rounded-full bg-teal-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent = "teal", delay = 0 }) {
  const accentMap = {
    teal: "text-teal-400 bg-teal-400/10 ring-teal-400/20",
    amber: "text-amber-400 bg-amber-400/10 ring-amber-400/20",
    sky: "text-sky-400 bg-sky-400/10 ring-sky-400/20",
    rose: "text-rose-400 bg-rose-400/10 ring-rose-400/20",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm transition-colors hover:border-white/[0.15] hover:bg-white/[0.04]"
    >
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl ring-1", accentMap[accent])}>
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-[family-name:var(--font-heading)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
    </motion.div>
  );
}

function ArchNode({ icon, name, role, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2 z-10"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-teal-300 shadow-[0_0_20px_-4px_rgba(45,212,191,0.4)]">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-neutral-200">{name}</p>
        <p className="text-[10px] text-neutral-500">{role}</p>
      </div>
    </motion.div>
  );
}

function ArchConnector({ delay = 0 }) {
  return (
    <div className="relative mx-2 h-px flex-1 self-center overflow-hidden bg-white/[0.08] sm:mx-4 md:mx-6">
      <motion.div
        className="absolute top-0 h-px w-10 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay }}
      />
    </div>
  );
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

  const runQuery = useCallback(async (raw) => {
    if (!raw.trim() || isThinking) return;
    setIsThinking(true);
    setResult(null);
    setError(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    runQuery(query);
    setQuery("");
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    runQuery(s);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060911] text-white">
      <BackgroundFX />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-5 flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            Live Agent &middot; Bengaluru Transit Network
          </div>

          <h1 className="max-w-2xl text-balance text-4xl font-medium tracking-tighter sm:text-5xl md:text-6xl font-[family-name:var(--font-heading)]">
            Commute Memory{" "}
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-teal-400 bg-clip-text text-transparent">
              Agent
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-balance text-sm text-neutral-400 sm:text-base">
            An AI transit companion that remembers your routes, preferences, and traffic
            patterns across Bengaluru &mdash; so every answer gets sharper over time.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative mt-10 w-full"
        >
          <div
            className={cn(
              "relative flex items-center gap-2 rounded-2xl border bg-white/[0.03] p-2 pl-4 backdrop-blur-xl transition-all duration-300",
              isFocused
                ? "border-teal-400/50 shadow-[0_0_0_1px_rgba(45,212,191,0.3),0_0_40px_-8px_rgba(45,212,191,0.5)]"
                : "border-white/[0.08]"
            )}
          >
            <Route className="h-4 w-4 shrink-0 text-teal-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask a route, e.g. route from Koramangala to Indiranagar"
              className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <Button
              type="submit"
              disabled={isThinking || !query.trim()}
              className={cn(
                "h-9 shrink-0 gap-1.5 rounded-xl px-4 text-sm transition-all",
                query.trim()
                  ? "bg-teal-400 text-black hover:bg-teal-300"
                  : "bg-white/[0.06] text-neutral-500"
              )}
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-teal-400/30 hover:text-teal-300"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </motion.form>

        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-8 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-neutral-400"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>Analyzing route &amp; memory</span>
              <TypingDots />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {result && !isThinking && (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mt-10 w-full"
            >
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  <span className="text-neutral-200">{result.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-neutral-200">{result.to}</span>
                </div>

                {result.recalled && (
                  <motion.div
                    initial={{ opacity: 0, x: -16, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 16 }}
                  >
                    <Badge className="gap-1.5 border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15">
                      <History className="h-3 w-3" />
                      Recalled from memory
                    </Badge>
                  </motion.div>
                )}
              </div>

              {result.recalled && result.memoryNote && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mb-6 text-center text-xs text-amber-300/70"
                >
                  {result.memoryNote}
                </motion.p>
              )}

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  icon={<Navigation className="h-4 w-4" />}
                  label="Distance"
                  value={`${result.stats.distanceKm} km`}
                  accent="teal"
                  delay={0.05}
                />
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  label="Duration"
                  value={result.stats.durationMin !== "--" ? `${result.stats.durationMin} min` : "-- min"}
                  accent="sky"
                  delay={0.12}
                />
                <StatCard
                  icon={<Gauge className="h-4 w-4" />}
                  label="Congestion"
                  value={result.stats.congestion}
                  sub={
                    result.stats.congestion === "Heavy"
                      ? "Consider alt. route"
                      : "Traffic is manageable"
                  }
                  accent={
                    result.stats.congestion === "Heavy"
                      ? "rose"
                      : result.stats.congestion === "Moderate"
                      ? "amber"
                      : "teal"
                  }
                  delay={0.19}
                />
                <StatCard
                  icon={<Zap className="h-4 w-4" />}
                  label="ETA"
                  value={result.stats.etaMin !== "--" ? `${result.stats.etaMin} min` : "-- min"}
                  sub="incl. buffer"
                  accent="amber"
                  delay={0.26}
                />
              </div>

              {result.routeCoordinates && result.routeCoordinates.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
                  className="mt-6 rounded-2xl border border-white/[0.08] overflow-hidden"
                >
                  <RouteMap
                    corridor={result.corridor}
                    congestion={result.congestionLevel}
                    routeCoordinates={result.routeCoordinates}
                    bottleneckIndices={result.bottleneckIndices}
                    originName={result.from}
                    destName={result.to}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 w-full"
          >
            <p className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 font-[family-name:var(--font-heading)]">
              <History className="h-3.5 w-3.5" /> Session memory
            </p>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setResult(h);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                    h.recalled
                      ? "border-amber-400/20 bg-amber-400/5 text-amber-300/80 hover:bg-amber-400/10"
                      : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-teal-400/20 hover:text-teal-300"
                  )}
                >
                  <span>{h.from}</span>
                  <ArrowRight className="h-3 w-3 opacity-50" />
                  <span>{h.to}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative z-10 border-t border-white/[0.06] bg-white/[0.015] py-8">
        <p className="mb-6 text-center text-[11px] uppercase tracking-widest text-neutral-500 font-[family-name:var(--font-heading)]">
          Agentic memory flow
        </p>
        <div className="mx-auto flex max-w-xl items-center justify-between px-6">
          <ArchNode
            icon={<Bot className="h-5 w-5" />}
            name="Google ADK"
            role="Agent framework"
            delay={0.05}
          />
          <ArchConnector delay={0} />
          <ArchNode
            icon={<Network className="h-5 w-5" />}
            name="OpenRouter"
            role="LLM routing"
            delay={0.15}
          />
          <ArchConnector delay={0.8} />
          <ArchNode
            icon={<Database className="h-5 w-5" />}
            name="CockroachDB"
            role="Persistent memory"
            delay={0.25}
          />
        </div>
      </div>
    </div>
  );
}
