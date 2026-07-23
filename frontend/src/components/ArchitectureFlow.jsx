import { Bot, Network, Database } from "lucide-react";
import ArchNode from "./ArchNode";
import ArchConnector from "./ArchConnector";

export default function ArchitectureFlow() {
  return (
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
  );
}
