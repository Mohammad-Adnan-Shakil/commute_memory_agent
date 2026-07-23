import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const STATUS_MESSAGES = [
  "Analyzing route...",
  "Checking congestion...",
  "Recalling preferences...",
  "Synthesizing recommendation...",
];

export default function TypingDots() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      <motion.span
        key={msgIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[11px] text-neutral-500 font-[family-name:var(--font-heading)]"
      >
        {STATUS_MESSAGES[msgIndex]}
      </motion.span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="h-2 w-2 rounded-full bg-teal-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
