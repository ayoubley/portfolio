"use client";

import { useRef } from "react";
import FluidSmoke from "./SmokeEffect";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer ref={footerRef} className="relative py-12 px-6 border-t border-card-border overflow-hidden">
      <FluidSmoke containerRef={footerRef} />
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Ayoub Bensadek. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
