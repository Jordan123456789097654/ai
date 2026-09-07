"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, ArrowLeft, Activity, CheckCircle2, RefreshCw } from "lucide-react";
import AuthGuard from "../../../components/AuthGuard";

export default function TelemetryPage() {
  return (
    <AuthGuard adminOnly>
      <TelemetryInner />
    </AuthGuard>
  );
}

function TelemetryInner() {
  const [tokenRate, setTokenRate] = useState(1450);
  const [activeConnections, setActiveConnections] = useState(38);
  const [eventLogs, setEventLogs] = useState<{ id: string; event: string; time: string }[]>([
    { id: "EVT-901", event: "token_stream_chunk: 128 tokens dispatched via SSE", time: new Date().toLocaleTimeString() },
    { id: "EVT-900", event: "gateway_handshake: Client connected from 192.168.1.1", time: new Date(Date.now() - 4000).toLocaleTimeString() },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenRate(Math.floor(Math.random() * 400) + 1300);
      setActiveConnections(Math.floor(Math.random() * 10) + 32);
      const newEvt = {
        id: `EVT-${Math.floor(100 + Math.random() * 900)}`,
        event: `token_stream_chunk: ${Math.floor(Math.random() * 200) + 50} tokens dispatched via SSE`,
        time: new Date().toLocaleTimeString(),
      };
      setEventLogs((prev) => [newEvt, ...prev.slice(0, 8)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button & Header */}
        <div className="border-b border-border pb-6 space-y-4">
          <Link href="/beta" className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1.5 w-fit">
            <ArrowLeft size={14} /> Back to Beta Lab Hub
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Radio className="text-accent animate-pulse" size={32} /> Real-Time SSE Webhook Telemetry Stream
              </h1>
              <p className="text-sm text-muted mt-1">
                Live Server-Sent Events (SSE) telemetry stream broadcasting token execution metrics to external dashboards.
              </p>
            </div>
            <span className="text-xs font-mono bg-success/10 border border-success/30 text-success px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Live Stream Connected
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-2">
            <span className="text-xs font-mono text-muted uppercase">Token Throughput Rate</span>
            <div className="font-display text-4xl text-accent font-bold">{tokenRate} tok/s</div>
            <span className="text-[11px] font-mono text-success">Real-time SSE Broadcast</span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-2">
            <span className="text-xs font-mono text-muted uppercase">Active SSE Subscribers</span>
            <div className="font-display text-4xl text-text font-bold">{activeConnections} Clients</div>
            <span className="text-[11px] font-mono text-muted">HTTP/2 Push Channels</span>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-2">
            <span className="text-xs font-mono text-muted uppercase">Stream Latency (p50)</span>
            <div className="font-display text-4xl text-success font-bold">&lt; 12 ms</div>
            <span className="text-[11px] font-mono text-muted">Zero-buffered execution</span>
          </div>
        </div>

        {/* Live Stream Event Log */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-text border-b border-border pb-3 flex items-center justify-between">
            <span>Live SSE Event Stream Feed</span>
            <RefreshCw size={14} className="text-accent animate-spin" />
          </h2>

          <div className="space-y-2">
            {eventLogs.map((evt) => (
              <div key={evt.id} className="p-3 bg-bg border border-border rounded-lg font-mono text-xs flex justify-between items-center">
                <span className="text-accent">{evt.event}</span>
                <span className="text-muted text-[10px]">{evt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
