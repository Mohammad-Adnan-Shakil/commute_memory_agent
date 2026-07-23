import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, History, Navigation, Clock, Gauge, Zap, Lightbulb } from "lucide-react";
import { Badge } from "./ui/badge";
import StatCard from "./StatCard";
import RouteMap from "./RouteMap";

function congestionAccent(level) {
  if (level === "Heavy") return "rose";
  if (level === "Moderate") return "amber";
  return "teal";
}

function congestionSub(level) {
  if (level === "Heavy") return "Consider alt. route";
  if (level === "Moderate") return "Traffic is manageable";
  return "Smooth traffic expected";
}

export default function ResultCard({ result, onSelectResult }) {
  if (!result) return null;

  return (
    <motion.div
      key={result.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mt-10 w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="mb-4 flex flex-wrap items-center justify-center gap-3"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm">
          <MapPin className="h-4 w-4 text-teal-400" />
          <span className="text-neutral-200 font-medium">{result.from}</span>
          <ArrowRight className="h-3.5 w-3.5 text-neutral-500" />
          <span className="text-neutral-200 font-medium">{result.to}</span>
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
      </motion.div>

      {result.recalled && result.memoryNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-6 mx-auto max-w-lg rounded-lg border border-amber-400/10 bg-amber-400/[0.03] px-4 py-2.5"
        >
          <p className="flex items-start gap-2 text-xs text-amber-300/70 leading-relaxed">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400/60 shrink-0 mt-0.5" />
            <span>{result.memoryNote}</span>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Navigation className="h-4 w-4" />}
          label="Distance"
          value={result.stats.distanceKm !== "--" ? result.stats.distanceKm : "--"}
          accent="teal"
          delay={0.05}
          tooltip="Estimated route distance based on corridor data"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Duration"
          value={result.stats.durationMin !== "--" ? result.stats.durationMin : "--"}
          accent="sky"
          delay={0.12}
          tooltip="Expected travel time under current conditions"
        />
        <StatCard
          icon={<Gauge className="h-4 w-4" />}
          label="Congestion"
          value={result.stats.congestion}
          sub={congestionSub(result.stats.congestion)}
          accent={congestionAccent(result.stats.congestion)}
          delay={0.19}
          tooltip="Traffic congestion estimate for this corridor"
        />
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="ETA"
          value={result.stats.etaMin !== "--" ? result.stats.etaMin : "--"}
          sub="incl. buffer"
          accent="amber"
          delay={0.26}
          tooltip="Estimated time of arrival including congestion buffer"
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
  );
}
