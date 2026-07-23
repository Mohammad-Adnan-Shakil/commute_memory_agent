import { motion } from "framer-motion";

function DotParticle({ x, y, delay }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r="1.5"
      fill="rgba(45,212,191,0.5)"
      initial={{ opacity: 0.2, y: 0 }}
      animate={{ opacity: [0.2, 0.6, 0.2], y: [-2, 2, -2] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

export default function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 -right-20 h-[380px] w-[380px] rounded-full bg-sky-500/10 blur-[120px] animate-pulse [animation-delay:1s]" />
      <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-amber-500/[0.06] blur-[110px] animate-pulse [animation-delay:2s]" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="network-lines" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 60 L40 20 L80 60 L120 30" fill="none" stroke="rgba(45,212,191,0.5)" strokeWidth="0.5" />
            <path d="M20 0 L50 40 L30 80 L60 120" fill="none" stroke="rgba(45,212,191,0.3)" strokeWidth="0.4" />
            <path d="M90 0 L70 50 L100 90 L80 120" fill="none" stroke="rgba(45,212,191,0.3)" strokeWidth="0.4" />
            <path d="M0 100 L40 80 L80 110 L120 90" fill="none" stroke="rgba(45,212,191,0.4)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-lines)" />
      </svg>

      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
        <DotParticle x={40} y={20} delay={0} />
        <DotParticle x={80} y={60} delay={0.5} />
        <DotParticle x={50} y={40} delay={1} />
        <DotParticle x={30} y={80} delay={1.5} />
        <DotParticle x={70} y={50} delay={2} />
        <DotParticle x={100} y={90} delay={2.5} />
        <DotParticle x={40} y={80} delay={3} />
        <DotParticle x={80} y={110} delay={3.5} />
      </svg>

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-px w-1/3 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
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
