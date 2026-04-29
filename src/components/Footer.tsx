"use client";

export default function Footer() {
  return (
    <footer className="relative py-6 px-6 border-t border-card-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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
