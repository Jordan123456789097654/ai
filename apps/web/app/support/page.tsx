"use client";

import { useState } from "react";
import { HelpCircle, MessageSquare, LifeBuoy, Search, Check, Send, ChevronDown, ChevronUp, FileText } from "lucide-react";

type FAQItem = { question: string; answer: string; category: string };

const FAQS: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I start using Kyro AI?",
    answer: "You can start chatting immediately on the /chat page without an account. To generate API keys or access high-concurrency rate limits, sign up for a free account in the Developer Portal.",
  },
  {
    category: "API & Models",
    question: "What OpenAI-compatible endpoints are supported?",
    answer: "Kyro provides a 100% OpenAI-compatible endpoint at POST /v1/chat/completions supporting standard streaming, system prompts, temperature, and top_p. You can pass 'kyro-coder-pro', 'kyro-ultra-70b', or 'kyro-flash-8b'.",
  },
  {
    category: "Rate Limits & Billing",
    question: "What are the rate limit quotas by tier?",
    answer: "Free tier accounts receive 20 requests/min. Pro tier includes 120 requests/min, and Enterprise accounts receive custom high-concurrency rate limits with 1,000+ requests/min.",
  },
  {
    category: "Security & Privacy",
    question: "Are my conversation prompts used for training?",
    answer: "No. Prompts sent to Kyro are processed ephemerally on Groq LPU hardware and are never used to train global base models.",
  },
];

type Ticket = { id: string; category: string; priority: string; subject: string; status: "Open" | "In Progress" | "Resolved"; date: string };

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: "TICK-9021", category: "API Integration", priority: "Medium", subject: "Rate limit header questions", status: "Resolved", date: "2026-09-04" },
  ]);

  const [category, setCategory] = useState("Technical / API");
  const [priority, setPriority] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newTicket: Ticket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      priority,
      subject: subject.trim(),
      status: "Open",
      date: new Date().toISOString().slice(0, 10),
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSubject("");
    setDescription("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const filteredFaqs = FAQS.filter(
    (f) => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="font-display text-3xl text-text">Help & Support Portal</h1>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Need help integrating Kyro AI or managing your developer credentials? Search our FAQs or submit a support ticket.
        </p>

        <div className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles & FAQs..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pl-10 text-sm outline-none focus:border-accent text-text"
          />
          <Search size={16} className="absolute left-3 top-5 text-muted" />
        </div>
      {/* Tawk.to Live Chat Banner */}
      <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="font-display text-lg text-accent font-bold flex items-center justify-center md:justify-start gap-2">
            <MessageSquare size={20} /> Live Chat Support (Powered by Tawk.to)
          </h2>
          <p className="text-xs text-muted">
            Connect instantly with our support team in real-time. Click the button or use the live chat widget at the bottom right.
          </p>
        </div>

        <button
          onClick={() => {
            if ((window as any).Tawk_API?.maximize) {
              (window as any).Tawk_API.maximize();
            } else {
              alert("Live Chat is initializing... Look for the chat widget in the bottom right corner!");
            }
          }}
          className="px-5 py-2.5 bg-accent text-ink font-semibold rounded text-xs flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <MessageSquare size={14} /> Open Live Chat Now
        </button>
      </div>

      <section className="border border-border rounded-lg bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <HelpCircle size={18} className="text-accent" />
          <h2 className="font-display text-xl">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {filteredFaqs.length === 0 && <p className="text-muted text-sm py-4">No matching FAQ articles found.</p>}
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded bg-surface-raised overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-text hover:text-accent"
              >
                <span>{faq.question}</span>
                {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-border/50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <MessageSquare size={18} className="text-accent" />
            <h2 className="font-display text-xl">Submit a Support Ticket</h2>
          </div>

          {submitted && (
            <div className="bg-success/10 border border-success/40 text-success p-3 rounded text-xs flex items-center gap-2 font-medium">
              <Check size={14} /> Ticket submitted successfully! Our team will respond shortly.
            </div>
          )}

          <form onSubmit={submitTicket} className="space-y-3 text-xs">
            <div>
              <label className="block text-muted font-medium mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
              >
                <option value="Technical / API">Technical / API Integration</option>
                <option value="Rate Limits / Quotas">Rate Limits / Tier Upgrades</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High / Urgent">High / Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue..."
                className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide steps to reproduce, API endpoints, or error codes..."
                className="w-full bg-surface-raised border border-border rounded p-2 text-text outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-accent text-ink rounded font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity text-sm"
            >
              <Send size={14} /> Submit Support Ticket
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="border border-border rounded-lg bg-surface p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText size={18} className="text-accent" />
              <h2 className="font-display text-xl">Your Support Tickets</h2>
            </div>

            <div className="border border-border rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-raised text-muted font-normal">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-raised/40">
                      <td className="p-2.5 font-mono text-accent">{t.id}</td>
                      <td className="p-2.5 text-text font-medium truncate max-w-[140px]">{t.subject}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            t.status === "Resolved"
                              ? "bg-success/10 text-success border border-success/30"
                              : "bg-accent/10 text-accent border border-accent/30"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-surface p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <LifeBuoy size={18} className="text-accent" />
              <h3 className="font-display text-lg">Direct Community & Docs</h3>
            </div>
            <p className="text-xs text-muted">Prefer direct community chat or live API logs?</p>
            <div className="flex flex-col gap-2 text-xs font-medium">
              <a href="/docs" className="text-accent hover:underline flex items-center gap-1">
                → Read API Documentation & SDK Guides
              </a>
              <a href="/dev" className="text-accent hover:underline flex items-center gap-1">
                → Manage API Keys & Webhook Alerts
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
