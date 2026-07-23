import { motion } from "framer-motion";

export default function ArchNode({ icon, name, role, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group flex flex-col items-center gap-2 z-10"
      title={`${name}: ${role}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-teal-300 shadow-[0_0_20px_-4px_rgba(45,212,191,0.4)] transition-all duration-300 group-hover:border-teal-400/30 group-hover:shadow-[0_0_30px_-4px_rgba(45,212,191,0.6)]">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-neutral-200">{name}</p>
        <p className="text-[10px] text-neutral-500">{role}</p>
      </div>
    </motion.div>
  );
}
