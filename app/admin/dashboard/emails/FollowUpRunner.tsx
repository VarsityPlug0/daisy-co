"use client";
import { useState } from "react";
import { Play, RefreshCw } from "lucide-react";

export default function FollowUpRunner() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/follow-ups", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(`Done — ${data.sent} sent, ${data.skipped} skipped`);
    } catch (e: unknown) {
      setResult(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <p className={`text-xs ${result.startsWith("Done") ? "text-green-400" : "text-red-400"}`}>
          {result}
        </p>
      )}
      <button
        onClick={run}
        disabled={running}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
      >
        {running ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
        {running ? "Running…" : "Run Now"}
      </button>
    </div>
  );
}
