import { motion } from "framer-motion";
import { MessageSquare, Navigation, UserCheck, Sparkles, Bot, Network, MapPin, Database } from "lucide-react";
import { ShaderBackground } from "./ui/electric-aura";
import Nav from "./Nav";

export default function LandingPage({ onSignupClick, onLoginClick, onTryWithoutAccount }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#060911] text-white flex flex-col justify-between">
      <div className="absolute inset-0 z-0">
        <ShaderBackground className="h-full w-full" />
      </div>

      <div className="relative z-20">
        <Nav
          isAuthenticated={false}
          user={null}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
          onLogoutClick={() => {}}
          onLogoClick={() => {}}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12 flex flex-col items-center text-center my-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-5 flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-xs text-neutral-400 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            Live Agent &middot; Bengaluru Transit Network
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl text-balance text-4xl font-medium tracking-tighter sm:text-5xl md:text-6xl font-[family-name:var(--font-heading)]"
          >
            Commute Memory{" "}
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-teal-400 bg-clip-text text-transparent">
              Agent
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-balance text-base text-neutral-300 sm:text-lg leading-relaxed"
          >
            An AI agent for Bengaluru commute planning that remembers your routes, preferences, and traffic patterns across sessions using persistent vector-based memory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={onSignupClick}
              className="rounded-xl bg-teal-400 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-teal-300 active:scale-[0.98] shadow-[0_0_25px_-5px_rgba(45,212,191,0.5)]"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={onTryWithoutAccount}
              className="rounded-xl border border-white/[0.15] bg-white/[0.04] px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:border-white/30 active:scale-[0.98]"
            >
              Try without an account
            </button>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-20 w-full max-w-4xl"
        >
          <p className="mb-8 text-center text-xs uppercase tracking-widest text-neutral-500 font-[family-name:var(--font-heading)]">
            How it works
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center rounded-2xl border border-white/[0.08] bg-[#060911]/90 p-6 backdrop-blur-xl transition-colors hover:border-teal-400/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-teal-300 shadow-[0_0_15px_-3px_rgba(45,212,191,0.3)]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-neutral-100 mb-1">Ask in plain English</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">Describe your origin, destination, and timing naturally.</p>
            </div>

            <div className="flex flex-col items-center text-center rounded-2xl border border-white/[0.08] bg-[#060911]/90 p-6 backdrop-blur-xl transition-colors hover:border-teal-400/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-teal-300 shadow-[0_0_15px_-3px_rgba(45,212,191,0.3)]">
                <Navigation className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-neutral-100 mb-1">Live routing data</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">Agent fetches live routing and checks known Bengaluru traffic corridors.</p>
            </div>

            <div className="flex flex-col items-center text-center rounded-2xl border border-white/[0.08] bg-[#060911]/90 p-6 backdrop-blur-xl transition-colors hover:border-teal-400/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-teal-300 shadow-[0_0_15px_-3px_rgba(45,212,191,0.3)]">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-neutral-100 mb-1">Persistent memory</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">Preferences remembered — sign up to keep them across devices & sessions.</p>
            </div>

            <div className="flex flex-col items-center text-center rounded-2xl border border-white/[0.08] bg-[#060911]/90 p-6 backdrop-blur-xl transition-colors hover:border-teal-400/30">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-teal-300 shadow-[0_0_15px_-3px_rgba(45,212,191,0.3)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-neutral-100 mb-1">Sharper over time</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">Every future answer gets smarter based on what it's learned.</p>
            </div>
          </div>
        </motion.div>

        {/* Architecture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-20 w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#060911]/90 p-8 backdrop-blur-xl"
        >
          <p className="mb-8 text-center text-xs uppercase tracking-widest text-neutral-500 font-[family-name:var(--font-heading)]">
            Agentic memory architecture
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#0a1220]/90 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-teal-300">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Google ADK</h4>
                  <span className="text-[10px] text-teal-400">Agent framework</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                Multi-agent orchestration: a router agent delegates to specialized route and advisor agents.
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#0a1220]/90 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-teal-300">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">OpenRouter</h4>
                  <span className="text-[10px] text-teal-400">LLM routing</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                LLM reasoning and tool-calling, routed to a free-tier model.
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#0a1220]/90 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-teal-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">GraphHopper</h4>
                  <span className="text-[10px] text-teal-400">Live routing API</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                Real-time distance, duration, and turn-by-turn road geometry for Bengaluru corridors.
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-[#0a1220]/90 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-teal-300">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">CockroachDB</h4>
                  <span className="text-[10px] text-teal-400">Persistent memory</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 mt-2 leading-relaxed">
                Route preferences stored as vector embeddings, recalled via similarity search.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-4 pb-12"
        >
          <button
            type="button"
            onClick={onSignupClick}
            className="rounded-xl bg-teal-400 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-teal-300 active:scale-[0.98] shadow-[0_0_25px_-5px_rgba(45,212,191,0.5)]"
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={onTryWithoutAccount}
            className="rounded-xl border border-white/[0.15] bg-white/[0.04] px-6 py-3 text-sm font-medium text-neutral-200 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:border-white/30 active:scale-[0.98]"
          >
            Try without an account
          </button>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-white/[0.01] py-6 text-center text-xs text-neutral-500">
        Commute Memory Agent &middot; Built with AWS & CockroachDB
      </footer>
    </div>
  );
}
