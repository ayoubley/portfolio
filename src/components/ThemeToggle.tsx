"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";

function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("theme") !== "light";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => true);

  if (typeof document !== "undefined") {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }

  const toggle = () => {
    if (isDark) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.add("light");
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
    }
    window.dispatchEvent(new StorageEvent("storage"));
  };

  return (
    <motion.button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full glass-card p-1 cursor-pointer"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-foreground"
        animate={{ x: isDark ? 0 : 26 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">
        {isDark ? "\u{1F319}" : ""}
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">
        {isDark ? "" : "\u{2600}\u{FE0F}"}
      </span>
    </motion.button>
  );
}
