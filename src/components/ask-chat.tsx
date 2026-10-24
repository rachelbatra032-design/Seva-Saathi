"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowUp, Bot, ExternalLink, FlaskConical, Loader2, Mic, ShieldCheck, Square, Volume2, VolumeX } from "lucide-react";
import type { AssistantReply } from "@/lib/assistant/types";
import { journeyBySlug } from "@/data/journeys";
import { getService } from "@/lib/services";
import { languageByCode } from "@/lib/languages";
import { useLanguage } from "@/components/language-provider";
import { LanguageSelect } from "@/components/language-select";
import { MiniChecklist } from "@/components/journey-planner";
import { OfficialLinkButton } from "@/components/official-link-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg =
  | { id: string; role: "user"; text: string; viaVoice?: boolean }
  | { id: string; role: "assistant"; reply: AssistantReply; notes: string[] }
  | { id: string; role: "error"; text: string; retry?: string };

type VoiceStatus = { sarvamConfigured: boolean; models: { stt: string; translate: string; tts: string } | null };
type VoicePhase = "idle" | "listening" | "transcribing";

const EXAMPLES = [
  "I just got married, how do I change my name?",
  "I lost my Aadhaar card",
  "I'm moving to another state, what do I need to update?",
  "How do I apply for a scholarship?",
];

function RichText({ text, onCite }: { text: string; onCite: (n: number) => void }) {
  const blocks = text.split(/\n{2,}|\n(?=\d+\. )/).map((b) => b.trim()).filter(Boolean);
  const renderInline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
      if (/^\*\*.+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
      const m = part.match(/^\[(\d+)\]$/);
      if (m) {
        const n = Number(m[1]);
        return (
          <sup key={i}>
            <button type="button" onClick={() => onCite(n)} className="mx-0.5 rounded px-1 text-[11px] font-semibold text-primary underline decoration-dotted hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Source ${n}`}>
              {n}
            </button>
          </sup>
        );
      }
      return <span key={i}>{part}</span>;
    });
  return (
    <div className="space-y-3 leading-relaxed">
      {blocks.map((b, i) => {
        const numbered = b.match(/^(\d+)\. ([\s\S]*)$/);
        if (numbered) {
          return (
            <p key={i} className="flex gap-2.5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{numbered[1]}</span>
              <span>{renderInline(numbered[2])}</span>
            </p>
          );
        }
        return <p key={i}>{renderInline(b)}</p>;
      })}
    </div>
  );
}

function AssistantMessage({
  msg,
  onFollowUp,
  onSpeak,
  speaking,
  speakError,
  canSpeak,
}: {
  msg: Extract<Msg, { role: "assistant" }>;
  onFollowUp: (q: string) => void;
  onSpeak: (id: string, reply: AssistantReply) => void;
  speaking: boolean;
  speakError?: string;
  canSpeak: boolean;
}) {
  const { reply } = msg;
  const journey = reply.journeySlug ? journeyBySlug[reply.journeySlug] : undefined;
  const services = reply.serviceSlugs.map((s) => getService(s)).filter((s) => !!s).slice(0, 4);
  const refusal = reply.intent === "refusal";
  const sourcesId = `sources-${reply.id}`;

  const jumpToCitation = (n: number) => {
    const el = document.getElementById(`${sourcesId}-${n}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
  };

  return (
    <div className="flex gap-3">
      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden><Bot className="size-4" /></span>
      <div className="min-w-0 flex-1 space-y-4">
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm border p-4 sm:p-5",
            refusal ? "border-saffron/50 bg-saffron-soft" : "border-border border-l-4 border-l-india-green bg-card shadow-sm",
          )}
        >
          {refusal && (
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><AlertCircle className="size-4 text-saffron" aria-hidden />I can&apos;t answer that from official sources</p>
          )}
          {reply.intent === "weak" && (
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><AlertCircle className="size-4 text-saffron" aria-hidden />Low confidence match</p>
          )}
          <RichText text={reply.text} onCite={jumpToCitation} />
          {reply.translation?.note && <p className="mt-3 text-xs text-muted-foreground">{reply.translation.note}</p>}
          {msg.notes.map((n) => (<p key={n} className="mt-1 text-xs text-muted-foreground">{n}</p>))}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onSpeak(msg.id, reply)} disabled={!canSpeak} aria-pressed={speaking}>
              {speaking ? <VolumeX className="size-3.5" aria-hidden /> : <Volume2 className="size-3.5" aria-hidden />}
              {speaking ? "Stop" : "Read aloud"}
            </Button>
            {speakError && <span role="alert" className="text-xs text-destructive">{speakError}</span>}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden />
              {reply.grounded ? "Grounded in official sources" : "Not answered, to avoid guessing"}
            </span>
          </div>
        </div>

        {journey && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading text-lg font-semibold">Your checklist: {journey.title}</h3>
              <Link href={`/journeys/${journey.slug}`} className="text-sm font-medium text-primary underline underline-offset-2">Open full guide with documents and form data</Link>
            </div>
            <div className="mt-3"><MiniChecklist journey={journey} /></div>
          </div>
        )}

        {!journey && services.length > 0 && !refusal && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <li key={s!.slug} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium">{s!.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s!.ministry}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OfficialLinkButton href={s!.url} className="py-1.5 text-xs">Official site</OfficialLinkButton>
                  <Link href={`/services/${s!.slug}`} className="inline-flex items-center rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted">Details</Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <section aria-label="Sources" className="rounded-xl border border-border bg-muted/50 p-4 shadow-sm">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-primary">Official sources (citations)</h3>
          {reply.citations.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No source was cited.</p>
          ) : (
            <ol className="mt-2 space-y-1.5 text-sm">
              {reply.citations.map((c) => (
                <li key={c.n} id={`${sourcesId}-${c.n}`} tabIndex={-1} className="flex items-start gap-2 rounded px-1 outline-none focus:bg-saffron-soft">
                  <span className="mt-0.5 text-xs font-semibold text-muted-foreground">[{c.n}]</span>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-wrap items-center gap-x-2 font-medium text-primary underline underline-offset-2">
                    {c.title}
                    <ExternalLink className="size-3" aria-hidden />
                    <span className="sr-only">(opens official site)</span>
                  </a>
                  <span className="text-xs text-muted-foreground">{c.publisher}{c.kind === "snapshot" ? " · page text on file" : ""}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {reply.followUps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reply.followUps.map((f) => (
              <button key={f} type="button" onClick={() => onFollowUp(f)} className="rounded-full border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {f}
              </button>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">Composed by: {reply.provider}. Seva Saathi is unofficial; confirm details on the official site before acting.</p>
      </div>
    </div>
  );
}

export function AskChat() {
  const params = useSearchParams();
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState<VoiceStatus | null>(null);
  const [demo, setDemo] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speakErrors, setSpeakErrors] = useState<Record<string, string>>({});
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const autoSent = useRef(false);
  const readAloudNext = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice/status")
      .then((r) => r.json())
      .then((s: VoiceStatus) => { if (!cancelled) setVoice(s); })
      .catch(() => { if (!cancelled) setVoice({ sarvamConfigured: false, models: null }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const stopSpeaking = useCallback(() => {
    audioEl.current?.pause();
    audioEl.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    async (id: string, reply: AssistantReply) => {
      if (speakingId === id) return stopSpeaking();
      stopSpeaking();
      setSpeakErrors((e) => ({ ...e, [id]: "" }));
      const useDemo = demo || !voice?.sarvamConfigured;
      const speechLang = reply.language;
      const plain = reply.text.replace(/\[\d+\]/g, "").replace(/\*\*/g, "");
      try {
        const res = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: plain, lang: speechLang, demo: useDemo }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not read the answer aloud.");
        setSpeakingId(id);
        if (data.mock) {
          if (!("speechSynthesis" in window)) throw new Error("This browser cannot read text aloud.");
          const u = new SpeechSynthesisUtterance(plain);
          u.lang = speechLang;
          u.onend = () => setSpeakingId(null);
          u.onerror = () => setSpeakingId(null);
          window.speechSynthesis.speak(u);
        } else {
          const audio = new Audio(`data:${data.mime};base64,${data.audioBase64}`);
          audioEl.current = audio;
          audio.onended = () => setSpeakingId(null);
          audio.onerror = () => { setSpeakingId(null); setSpeakErrors((e) => ({ ...e, [id]: "Audio playback failed." })); };
          await audio.play();
        }
      } catch (err) {
        setSpeakingId(null);
        setSpeakErrors((e) => ({ ...e, [id]: err instanceof Error ? err.message : "Could not read aloud." }));
      }
    },
    [demo, speakingId, stopSpeaking, voice],
  );

  const send = useCallback(
    async (text: string, opts?: { inputLang?: string | null; viaVoice?: boolean }) => {
      const message = text.trim();
      if (!message || busy) return;
      setInput("");
      setVoiceError(null);
      const userId = crypto.randomUUID();
      setMessages((m) => [...m, { id: userId, role: "user", text: message, viaVoice: opts?.viaVoice }]);
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, lang, inputLang: opts?.inputLang ?? undefined, demo }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
        const id = crypto.randomUUID();
        setMessages((m) => [...m, { id, role: "assistant", reply: data.reply as AssistantReply, notes: (data.notes as string[]) ?? [] }]);
        if (readAloudNext.current) {
          readAloudNext.current = false;
          void speak(id, data.reply as AssistantReply);
        }
      } catch (err) {
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "error", text: err instanceof Error ? err.message : "Something went wrong.", retry: message }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, demo, lang, speak],
  );

  useEffect(() => {
    const q = params.get("q");
    if (q && !autoSent.current) {
      autoSent.current = true;
      void send(q);
    }
  }, [params, send]);

  async function uploadAndAsk(blob: Blob) {
    setPhase("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, "question.webm");
      const res = await fetch(`/api/voice/transcribe?lang=${encodeURIComponent(lang)}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Transcription failed.");
      setPhase("idle");
      readAloudNext.current = true;
      await send(data.transcript, { inputLang: data.languageCode, viaVoice: true });
    } catch (err) {
      setPhase("idle");
      setVoiceError(err instanceof Error ? err.message : "Voice input failed.");
    }
  }

  async function onMic() {
    setVoiceError(null);
    if (phase === "listening") {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      recorder.current?.stop();
      return;
    }
    if (phase !== "idle" || busy) return;

    if (demo) {
      setPhase("listening");
      await new Promise((r) => setTimeout(r, 1600));
      setPhase("transcribing");
      try {
        const res = await fetch(`/api/voice/transcribe?demo=1&lang=${encodeURIComponent(lang)}`, { method: "POST" });
        const data = await res.json();
        setPhase("idle");
        readAloudNext.current = true;
        setInput(data.transcript);
        await send(data.transcript, { inputLang: data.languageCode, viaVoice: true });
      } catch {
        setPhase("idle");
        setVoiceError("Demo voice failed to start.");
      }
      return;
    }

    if (!voice?.sarvamConfigured) {
      setShowVoiceHelp(true);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("This browser cannot record audio. Please type your question instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        void uploadAndAsk(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
      };
      recorder.current = rec;
      rec.start();
      setPhase("listening");
      stopTimer.current = setTimeout(() => rec.state === "recording" && rec.stop(), 30000);
    } catch (err) {
      setPhase("idle");
      setVoiceError(err instanceof DOMException && err.name === "NotAllowedError" ? "Microphone permission was denied. Allow it in your browser, or type your question." : "Could not start the microphone.");
    }
  }

  const micLabel = phase === "listening" ? "Stop recording" : t.tapToSpeak;
  const langName = languageByCode[lang]?.name ?? lang;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <p className="text-sm text-muted-foreground">Answer language ({langName})</p>
        <LanguageSelect />
      </div>
      <p className="pb-3 text-xs text-muted-foreground">{t.voicePrivacy}</p>

      <div className="space-y-6 pb-6" aria-live="polite" aria-busy={busy}>
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <h2 className="text-2xl font-semibold text-primary">What do you need to get done?</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Describe a situation in plain words. I will match it to official sources, give you an ordered plan, and cite every link. If I do not have a reliable source, I will say so instead of guessing.
            </p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((e) => (
                <li key={e}>
                  <button type="button" onClick={() => send(e)} className="rounded-full border border-input bg-background px-3.5 py-2 text-sm hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {e}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground">
                  {m.viaVoice && <Mic className="mr-1.5 inline size-3.5 align-[-2px]" aria-label="Spoken" />}
                  {m.text}
                </p>
              </div>
            );
          }
          if (m.role === "error") {
            return (
              <div key={m.id} role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
                <div className="flex-1">
                  <p className="font-medium">That did not work</p>
                  <p className="text-sm text-muted-foreground">{m.text}</p>
                  {m.retry && <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => send(m.retry!)}>Try again</Button>}
                </div>
              </div>
            );
          }
          return (
            <AssistantMessage
              key={m.id}
              msg={m}
              onFollowUp={(q) => send(q)}
              onSpeak={speak}
              speaking={speakingId === m.id}
              speakError={speakErrors[m.id]}
              canSpeak={true}
            />
          );
        })}

        {busy && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><Loader2 className="size-4 animate-spin" aria-hidden /></span>
            Checking official sources…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {showVoiceHelp && !demo && !voice?.sarvamConfigured && (
        <div role="dialog" aria-label="Voice needs configuration" className="mb-3 rounded-xl border border-saffron/50 bg-saffron-soft p-4 text-sm">
          <p className="font-semibold">Voice needs configuration</p>
          <p className="mt-1 text-foreground/85">
            Speech-to-text, translation and read-aloud use Sarvam AI, and this server has no <code className="rounded bg-background px-1 font-mono text-xs">SARVAM_API_KEY</code> set. Text chat works fine without it. The site owner can add the key to enable real voice (see the README).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => { setDemo(true); setShowVoiceHelp(false); }}>
              <FlaskConical className="size-3.5" aria-hidden /> Try demo mode
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowVoiceHelp(false)}>Dismiss</Button>
          </div>
        </div>
      )}
      {demo && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-india-green/40 bg-india-green-soft p-3 text-sm">
          <p className="flex items-center gap-2"><FlaskConical className="size-4 text-india-green" aria-hidden /><span><strong>Demo mode.</strong> Voice, translation and read-aloud are simulated. No audio leaves your device.</span></p>
          <Button type="button" size="sm" variant="outline" onClick={() => setDemo(false)}>Turn off</Button>
        </div>
      )}
      {voiceError && <p role="alert" className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{voiceError}</p>}

      <form
        onSubmit={(e) => { e.preventDefault(); void send(input); }}
        className="sticky bottom-3 rounded-2xl border border-border bg-background p-2 shadow-lg"
        aria-label="Ask a question"
      >
        <label htmlFor="ask-input" className="sr-only">{t.askTitle}</label>
        <div className="flex items-end gap-2">
          <textarea
            id="ask-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            rows={2}
            maxLength={600}
            placeholder={phase === "listening" ? t.listening : t.askPlaceholder}
            className="max-h-40 min-h-12 flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onMic}
            disabled={busy || phase === "transcribing"}
            aria-label={micLabel}
            aria-pressed={phase === "listening"}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl border border-input transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              phase === "listening" ? "animate-pulse border-destructive bg-destructive text-white" : "bg-background hover:bg-muted",
            )}
          >
            {phase === "transcribing" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : phase === "listening" ? <Square className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
          </button>
          <button type="submit" disabled={busy || !input.trim()} aria-label={t.askButton} className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50">
            <ArrowUp className="size-5" aria-hidden />
          </button>
        </div>
        <p className="px-3 pb-1 pt-1 text-[11px] text-muted-foreground">
          Don&apos;t share Aadhaar, PAN, OTPs or passwords here. Language: {langName}. {phase === "listening" && <span className="font-medium text-destructive">{t.listening}</span>}
        </p>
      </form>
    </div>
  );
}
