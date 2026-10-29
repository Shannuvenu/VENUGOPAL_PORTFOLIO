"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "./icons";

export default function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setFailed(false);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1 text-xs text-fg-2 transition-colors hover:border-accent/60 hover:text-accent ${className}`}
    >
      {done ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
      <span aria-live="polite">{done ? "Copied" : failed ? "Copy failed — select manually" : label}</span>
    </button>
  );
}
