"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Play, Plus, CheckCircle2, ShieldCheck, Calendar, Sparkles, Terminal, Trash2 } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import AuthGuard from "../../../components/AuthGuard";

export default function AgentCronPage() {
  return (
    <AuthGuard adminOnly>
      <AgentCronInner />
    </AuthGuard>
  );
}

function AgentCronInner() {
  const [taskName, setTaskName] = useState("Daily Support Ticket Escalation Summary");
  const [cronExpression, setCronExpression] = useState("0 9 * * *");
  const [agentPrompt, setAgentPrompt] = useState("Scan all unresolved support tickets, group them by priority, and generate an executive summary report for admins every day at 9:00 AM.");
  const [jobs, setJobs] = useState<any[]>([
    {
      jobId: "CRON-8419",
      taskName: "Weekly GitHub Dependency Vulnerability Scan",
      cronExpression: "0 0 * * 1",
      agentPrompt: "Scan all package.json files for security vulnerabilities every Monday at midnight.",
      status: "ACTIVE",
      nextRun: "2026-09-07T00:00:00.000Z",
    },
  ]);
  const [isScheduling, setIsScheduling] = useState(false);

  async function handleSchedule() {
    setIsScheduling(true);
    try {
      const res = await apiFetch("/v1/beta/schedule-cron", {
        method: "POST",
        body: JSON.stringify({ taskName, cronExpression, agentPrompt }),
      });
      if (res.job) {
        setJobs((prev) => [res.job, ...prev]);
        setTaskName("");
        setAgentPrompt("");
      }
    } finally {
      setIsScheduling(false);
    }
  }

  function handleRemoveJob(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <Link href="/beta" className="text-xs font-mono text-accent hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={12} /> Back to Beta Laboratory Hub
            </Link>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Clock className="text-accent" size={32} /> Autonomous AI Agent Task Scheduler & Cron Engine
            </h1>
            <p className="text-xs text-muted">
              Schedule recurring AI agent jobs (e.g. daily support ticket summaries, weekly dependency vulnerability audits, automated database health checks).
            </p>
          </div>
          <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full font-semibold">
            /beta/agent-cron
          </span>
        </div>

        {/* Schedule New Job Form */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xl">
          <h2 className="font-display text-base font-bold text-text flex items-center gap-2 border-b border-border pb-3">
            <Plus size={18} className="text-accent" /> Schedule New Autonomous AI Cron Job
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-mono text-muted uppercase">Task Name</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 text-xs text-text outline-none focus:border-accent"
                placeholder="Task Name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted uppercase">Cron Schedule (Standard 5-field)</label>
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 text-xs font-mono text-text outline-none focus:border-accent"
                placeholder="0 9 * * *"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted uppercase">AI Agent Instruction Prompt</label>
            <textarea
              rows={3}
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-3 text-xs text-text font-mono outline-none focus:border-accent"
              placeholder="Instructions for the recurring AI agent..."
            />
          </div>

          <button
            onClick={handleSchedule}
            disabled={isScheduling || !taskName.trim()}
            className="w-full md:w-auto px-6 py-2.5 bg-accent text-ink font-semibold rounded-lg text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Calendar size={14} /> {isScheduling ? "Registering AI Cron Schedule..." : "Schedule AI Cron Job"}
          </button>
        </div>

        {/* Active Scheduled Jobs Table */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display text-base font-bold text-text flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent" /> Active Scheduled AI Cron Jobs ({jobs.length})
            </h3>
            <span className="text-xs font-mono text-success flex items-center gap-1">
              <CheckCircle2 size={12} /> Autonomous Daemon Listening
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted font-mono">No active cron jobs scheduled.</div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-bg border border-border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-accent text-sm">{job.taskName}</span>
                      <span className="bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 rounded text-[10px]">
                        {job.jobId}
                      </span>
                      <span className="bg-success/10 border border-success/30 text-success px-2 py-0.5 rounded text-[10px]">
                        {job.cronExpression}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted line-clamp-1">{job.agentPrompt}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/50 pt-2 md:pt-0">
                    <div className="text-[11px] text-muted text-right">
                      Next run: <span className="text-text">{new Date(job.nextRun).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveJob(job.jobId)}
                      className="p-1.5 text-muted hover:text-danger rounded hover:bg-surface transition-colors"
                      title="Cancel Cron Job"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
