import { motion } from "framer-motion";
import Logo from "./Logo";

function formatEmail(email) {
  if (!email) return "";
  if (email.length <= 24) return email;
  const parts = email.split("@");
  if (parts.length !== 2) {
    return email.slice(0, 21) + "...";
  }
  const [local, domain] = parts;
  const domainPart = "@" + domain;
  const maxLocalLen = 24 - domainPart.length - 3;
  if (maxLocalLen <= 0) {
    return email.slice(0, 21) + "...";
  }
  return local.slice(0, maxLocalLen) + "..." + domainPart;
}

export default function Nav({ isAuthenticated, user, onLoginClick, onSignupClick, onLogoutClick, onLogoClick }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative z-30 w-full border-b border-white/[0.08] bg-[#060911]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center rounded-lg transition-opacity hover:opacity-80"
          aria-label="Home"
        >
          <Logo />
        </button>

        <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span
              className="hidden text-xs text-neutral-400 sm:inline max-w-[200px] truncate"
              title={user?.email}
            >
              {formatEmail(user?.email)}
            </span>
            <button
              type="button"
              onClick={onLogoutClick}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-rose-400/30 hover:text-rose-300"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-lg px-3.5 py-1.5 text-sm text-neutral-300 transition-colors hover:text-white"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={onSignupClick}
              className="rounded-lg bg-teal-400 px-3.5 py-1.5 text-sm font-semibold text-black transition-all hover:bg-teal-300 active:scale-[0.97]"
            >
              Sign up
            </button>
          </>
        )}
        </div>
      </div>
    </motion.nav>
  );
}
