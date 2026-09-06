"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Radio, Play, Pause, Settings, Code2, Check, Copy } from "lucide-react";
import { apiFetch } from "../../lib/api";

type VoicePersona = {
  id: string;
  name: string;
  gender: string;
  description: string;
  sampleFrequency: number;
};

const VOICE_PERSONAS: VoicePersona[] = [
  { id: "nova", name: "Nova", gender: "Female", description: "Warm, energetic, natural conversation tone", sampleFrequency: 220 },
  { id: "echo", name: "Echo", gender: "Male", description: "Deep, authoritative, technical specialist", sampleFrequency: 180 },
  { id: "onyx", name: "Onyx", gender: "Male", description: "Resonant, calm executive reasoning", sampleFrequency: 140 },
  { id: "shimmer", name: "Shimmer", gender: "Female", description: "Bright, articulate, clear expression", sampleFrequency: 320 },
  { id: "alloy", name: "Alloy", gender: "Neutral", description: "Balanced, neutral assistant tone", sampleFrequency: 250 },
  { id: "fable", name: "Fable", gender: "Neutral", description: "Expressive narrative storytelling", sampleFrequency: 210 },
];

export default function VoicePage() {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [inputText, setInputText] = useState("Hello! I am Kyro AI Voice Assistant. How can I help you build your project today?");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<{ speaker: "User" | "AI"; text: string; time: string }[]>([
    { speaker: "AI", text: "Hello! I am Kyro AI Voice Assistant. How can I help you build your project today?", time: new Date().toLocaleTimeString() },
  ]);

  const [copiedCode, setCopiedCode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Animated Waveform Heights State
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 80, 50, 95, 30, 70, 40, 90, 60, 25, 85, 35]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying || isListening) {
      interval = setInterval(() => {
        setWaveHeights(Array.from({ length: 14 }, () => Math.floor(Math.random() * 75) + 15));
      }, 120);
    } else {
      setWaveHeights([20, 25, 30, 25, 20, 15, 20, 25, 20, 15, 20, 25, 20, 15]);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isListening]);

  async function speakText(textToSpeak: string) {
    if (!textToSpeak.trim()) return;
    setIsPlaying(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/v1/audio/speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: textToSpeak, voice: selectedPersona.id }),
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          audioRef.current.onended = () => setIsPlaying(false);
        } else {
          setIsPlaying(false);
        }
      } else {
        // Fallback Web Speech API if offline
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlaying(false);
        }
      }
    } catch {
      setIsPlaying(false);
    }
  }

  function toggleListen() {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is supported in Chrome, Edge, and Safari.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const recognizedText = event.results[0][0].transcript;
      setIsListening(false);

      if (recognizedText) {
        const userTime = new Date().toLocaleTimeString();
        setTranscriptHistory((prev) => [
          ...prev,
          { speaker: "User", text: recognizedText, time: userTime },
        ]);

        // Trigger AI Voice Response
        const aiResponse = `I heard you say: "${recognizedText}". Kyro AI is processing your voice directive now.`;
        setTimeout(() => {
          setTranscriptHistory((prev) => [
            ...prev,
            { speaker: "AI", text: aiResponse, time: new Date().toLocaleTimeString() },
          ]);
          speakText(aiResponse);
        }, 600);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }

  function copyCodeSnippet() {
    const code = `import { OpenAI } from "openai";
import fs from "fs";

const openai = new OpenAI({
  baseURL: "https://kyro-api-auou.onrender.com/v1",
  apiKey: "kyro_sk_live_your_key"
});

// Text-To-Speech (Ultra-Realistic Speech Synthesis)
const mp3 = await openai.audio.speech.create({
  model: "tts-1-hd",
  voice: "${selectedPersona.id}",
  input: "Welcome to Kyro Voice AI."
});

const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile("output.mp3", buffer);`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-10 font-sans">
      <audio ref={audioRef} className="hidden" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Radio className="text-accent animate-pulse" size={30} /> Ultra-Realistic AI Voice Studio
            </h1>
            <p className="text-sm text-muted mt-1">
              Interactive voice conversation engine powered by Kyro TTS & STT OpenAI compatible endpoints (`POST /v1/audio/speech`).
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full">
            <Sparkles size={14} /> High-Definition Audio Active
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Visualizer & Voice Orb Stage (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-8 flex flex-col justify-between items-center space-y-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

            {/* Top Persona Banner */}
            <div className="w-full flex items-center justify-between border-b border-border/60 pb-4 z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent animate-ping" />
                <span className="font-mono text-xs font-bold text-text">Persona: {selectedPersona.name} ({selectedPersona.gender})</span>
              </div>
              <span className="text-[11px] font-mono text-muted bg-surface-raised border border-border px-2.5 py-0.5 rounded">
                22.05 kHz PCM
              </span>
            </div>

            {/* Glowing Orb & Waveform Display */}
            <div className="my-10 flex flex-col items-center justify-center space-y-8 z-10">
              <div
                className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isPlaying || isListening
                    ? "border-accent bg-accent/20 scale-110 shadow-accent/50"
                    : "border-border bg-surface-raised/60 shadow-black/40"
                }`}
              >
                <div className="w-28 h-28 rounded-full bg-accent/30 flex items-center justify-center animate-pulse">
                  <Volume2 size={42} className={isPlaying ? "text-accent" : "text-muted"} />
                </div>
              </div>

              {/* Animated Waveform Equalizer */}
              <div className="flex items-end gap-1.5 h-16 px-6 py-2 bg-surface-raised/80 border border-border rounded-full">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isPlaying || isListening ? "bg-accent" : "bg-muted/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Voice Control Buttons */}
            <div className="w-full flex items-center justify-center gap-4 z-10 border-t border-border/60 pt-6">
              <button
                onClick={toggleListen}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-lg ${
                  isListening
                    ? "bg-danger text-ink animate-bounce"
                    : "bg-accent text-ink hover:opacity-90"
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? "Listening..." : "Speak to AI"}
              </button>

              <button
                onClick={() => speakText(inputText)}
                disabled={isPlaying}
                className="flex items-center gap-2 px-6 py-3 bg-surface-raised border border-border rounded-full font-semibold text-sm text-text hover:border-accent transition-colors"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? "Speaking..." : "Synthesize Input"}
              </button>
            </div>
          </div>

          {/* Voice Persona Controls & Transcript (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Persona Switcher */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <Settings size={14} /> Voice Persona Preset
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {VOICE_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p)}
                    className={`p-3 rounded-lg border text-left transition-all space-y-1 ${
                      selectedPersona.id === p.id
                        ? "border-accent bg-accent/10"
                        : "border-border bg-surface-raised/40 hover:border-accent/40"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-text">{p.name}</span>
                      <span className="text-[10px] font-mono text-muted">{p.gender}</span>
                    </div>
                    <p className="text-[10px] text-muted line-clamp-1">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Speech Textarea */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <label className="block text-xs font-mono font-bold text-muted uppercase tracking-wider">
                Custom Speech Text Input
              </label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-lg p-3 text-xs text-text outline-none focus:border-accent font-sans leading-relaxed"
              />
            </div>

            {/* Conversation Transcript Feed */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3 max-h-[300px] overflow-y-auto">
              <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                Live Conversation Transcript
              </h3>

              <div className="space-y-2.5">
                {transcriptHistory.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-xs font-sans space-y-1 border ${
                      t.speaker === "AI"
                        ? "bg-accent/5 border-accent/30 text-text"
                        : "bg-surface-raised border-border text-text"
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono text-[10px] text-muted">
                      <span className={t.speaker === "AI" ? "text-accent font-bold" : "font-bold text-text"}>
                        {t.speaker}
                      </span>
                      <span>{t.time}</span>
                    </div>
                    <p className="leading-relaxed">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OpenAI API Code Snippet */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-accent flex items-center gap-1.5">
                  <Code2 size={14} /> OpenAI SDK Speech Code
                </span>
                <button
                  onClick={copyCodeSnippet}
                  className="text-xs font-mono text-muted hover:text-text flex items-center gap-1"
                >
                  {copiedCode ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-muted overflow-x-auto p-2 bg-bg rounded border border-border">
                <code>{`await openai.audio.speech.create({\n  model: "tts-1-hd",\n  voice: "${selectedPersona.id}",\n  input: "..." \n});`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
