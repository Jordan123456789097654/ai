"use client";

import { useState } from "react";
import { Play, RotateCcw, Save, Check } from "lucide-react";
import { apiFetch } from "../lib/api";

const DEFAULT_INSTRUCTIONS = `- If the message is an inquiry, answer it using only the provided information.
- If unsure about the answer to an inquiry, state that your knowledge is limited to the specific information provided by this business.
- If there are multiple inquiries in a message, answer them one by one.
- Refuse to tell jokes.`;

const MAX_CHARACTERS = 20000;

export default function AgentInstructionsPanel({
  onSaveCallback,
}: {
  onSaveCallback?: (instructions: string) => void;
}) {
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const remainingChars = MAX_CHARACTERS - instructions.length;

  function handleResetDefault() {
    setInstructions(DEFAULT_INSTRUCTIONS);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // Send updated system prompt instructions to backend API config
      await apiFetch("/admin/config", {
        method: "PUT",
        body: JSON.stringify({ globalSystemPrompt: instructions }),
      }).catch(() => {});

      if (onSaveCallback) onSaveCallback(instructions);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-[#12141A] border border-[#222734] rounded-xl p-6 space-y-4 shadow-xl text-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white tracking-tight">Instructions</h2>
        <button
          type="button"
          onClick={() => alert("Launching AI Agent Prompt Engineering Video Tutorial...")}
          className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-emerald-400 transition-colors"
        >
          Watch Video <Play size={12} className="fill-emerald-500 text-emerald-500" />
        </button>
      </div>

      {/* Description */}
      <div className="space-y-2 text-xs leading-relaxed">
        <p className="text-gray-300">
          Instructions guide your AI Agent on how to answer on your behalf.
        </p>
        <p className="text-gray-400">
          Be explicit in telling it how to behave. Or just leave the default Instructions.
        </p>
        <p className="text-rose-500 font-medium pt-1">
          Attention: Please be aware that modifying the Instructions may have significant impacts on our AI's performance. If necessary, you can always reset the Instructions.
        </p>
      </div>

      {/* Instructions Textarea Box */}
      <div className="border border-[#2D3446] rounded-xl bg-[#0B0C10] p-3 transition-colors focus-within:border-emerald-500">
        <textarea
          rows={7}
          maxLength={MAX_CHARACTERS}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full bg-transparent text-xs text-gray-200 font-mono leading-relaxed outline-none resize-y"
          placeholder="Enter custom AI system instructions here..."
        />
      </div>

      {/* Character Counter & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <span className="text-xs font-mono text-gray-400">
          {remainingChars.toLocaleString()} remaining characters
        </span>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-4 py-2 border border-[#2D3446] rounded-lg text-xs font-semibold text-gray-300 hover:bg-[#1A1E29] hover:text-white transition-all flex items-center gap-1.5"
          >
            <RotateCcw size={13} /> Use default
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
          >
            {savedSuccess ? (
              <>
                <Check size={14} /> Saved!
              </>
            ) : isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save size={14} /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
