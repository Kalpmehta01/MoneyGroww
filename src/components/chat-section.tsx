import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, RotateCcw, Calculator } from 'lucide-react';
import { Button } from './ui/button';
import { getFallbackResponse } from '../lib/chat-fallback';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  /** Answered by the offline rule-based responder, not the AI backend. */
  offline?: boolean;
}

interface ChatSectionProps {
  onNavigateToCalculators: (tabValue?: string) => void;
}

const WELCOME: Message = {
  id: 0,
  text: "Hi, I'm the MoneyGroww assistant. Ask me about SIPs, mutual funds, loans and EMIs, tax-saving options or budgeting, and I'll explain it in plain language.",
  isBot: true,
};

const SUGGESTIONS = [
  'How does compounding work?',
  'SIP or lumpsum — which is better?',
  'How big should my emergency fund be?',
  'What are my options under Section 80C?',
  'How do I estimate my retirement corpus?',
  'Explain the 50-30-20 rule',
];

/* -------------------------------------------------------------------------- */
/*  Minimal, safe markdown: paragraphs, bullet/numbered lists and **bold**.   */
/*  Rendered as React nodes, never as HTML, so model output can't inject markup.*/
/* -------------------------------------------------------------------------- */

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={blocks.length}>{inline(para.join(' '))}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((item, i) => <li key={i}>{inline(item)}</li>);
      blocks.push(
        list.ordered ? (
          <ol key={blocks.length} className="list-decimal space-y-1 pl-5">{items}</ol>
        ) : (
          <ul key={blocks.length} className="list-disc space-y-1 pl-5">{items}</ul>
        )
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•])\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (!line) {
      flushPara();
      flushList();
    } else if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <p key={blocks.length} className="font-semibold text-ink">
          {inline(heading[1])}
        </p>
      );
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-2.5">{blocks}</div>;
}

/* -------------------------------------------------------------------------- */

async function getAIResponse(history: Message[]): Promise<{ text: string; offline: boolean }> {
  const last = history[history.length - 1];
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history
          .filter((m) => m.id !== WELCOME.id)
          .map((m) => ({ role: m.isBot ? 'assistant' : 'user', content: m.text })),
      }),
    });
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    if (!response.ok || !isJson) throw new Error(`chat function returned ${response.status}`);

    const data = await response.json();
    if (typeof data.reply === 'string' && data.reply.trim()) {
      return { text: data.reply.trim(), offline: false };
    }
    throw new Error('Empty reply from chat function');
  } catch (err) {
    // Offline, `vite dev` without `netlify dev`, missing API key, rate limit…
    // answer from the built-in responder rather than showing an error.
    console.warn('Falling back to rule-based response:', err);
    return { text: getFallbackResponse(last.text), offline: true };
  }
}

export function ChatSection({ onNavigateToCalculators }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll the conversation pane (not the page) to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  // Grow the composer with its content, up to a limit.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || pending) return;

    const userMessage: Message = { id: Date.now(), text: content, isBot: false };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setPending(true);

    const reply = await getAIResponse(history);
    setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply.text, isBot: true, offline: reply.offline }]);
    setPending(false);
    inputRef.current?.focus();
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput('');
    inputRef.current?.focus();
  };

  const hasConversation = messages.length > 1;

  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <header className="max-w-2xl">
          <h2 className="t-h2 text-ink">Ask the assistant</h2>
          <p className="t-body mt-3">
            Plain-language answers to personal finance questions, from how SIPs compound to what
            Section 80C covers. It explains concepts; it does not recommend specific funds or stocks.
          </p>
        </header>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* ------------------------------------------------ Conversation */}
          <div className="flex h-[600px] flex-col overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-ink"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 14.5 7.5 9l3.5 3.5L17 5.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight text-ink">MoneyGroww assistant</p>
                  <p className="text-[0.75rem] leading-tight text-ink-3">Educational answers, not investment advice</p>
                </div>
              </div>
              {hasConversation && (
                <Button variant="ghost" size="sm" onClick={reset} disabled={pending}>
                  <RotateCcw aria-hidden="true" />
                  New chat
                </Button>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-6"
              aria-live="polite"
              aria-busy={pending}
            >
              {messages.map((m) =>
                m.isBot ? (
                  <div key={m.id} className="flex max-w-[88%] flex-col items-start">
                    <div className="rounded-lg rounded-tl-sm border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink-2">
                      <RichText text={m.text} />
                    </div>
                    {m.offline && (
                      <span className="mt-1.5 text-[0.6875rem] text-ink-3">
                        Answered offline — the AI service is unavailable right now
                      </span>
                    )}
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-lg rounded-tr-sm bg-accent px-4 py-3 text-sm leading-relaxed text-accent-ink">
                      {m.text}
                    </div>
                  </div>
                )
              )}

              {pending && (
                <div className="flex">
                  <div
                    className="flex items-center gap-1 rounded-lg rounded-tl-sm border border-line bg-surface-2 px-4 py-3.5"
                    role="status"
                  >
                    <span className="sr-only">The assistant is writing a reply</span>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        aria-hidden="true"
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!hasConversation && (
                <div className="flex flex-wrap gap-2 pt-1 lg:hidden">
                  {SUGGESTIONS.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-line-2 bg-surface px-3 py-1.5 text-[0.8125rem] text-ink-2 transition-colors duration-[120ms] hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <div className="flex items-end gap-2 rounded-lg border border-line-2 bg-input-background p-1.5 pl-3 transition-[border-color] duration-[120ms] focus-within:border-accent">
                <label htmlFor="chat-input" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={500}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask about SIPs, loans, tax saving…"
                  className="max-h-[140px] flex-1 resize-none bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-ink-3"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-9 shrink-0"
                  disabled={pending || !input.trim()}
                  aria-label="Send message"
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-2 px-1 text-[0.6875rem] text-ink-3">
                Enter to send · Shift + Enter for a new line
              </p>
            </form>
          </div>

          {/* ---------------------------------------------------- Side panel */}
          <aside className="space-y-6">
            <div className="hidden rounded-lg border border-line bg-surface lg:block">
              <h3 className="t-h3 border-b border-line px-5 py-4 text-ink">Try asking</h3>
              <ul className="divide-y divide-line">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => send(s)}
                      disabled={pending}
                      className="w-full px-5 py-3 text-left text-sm text-ink-2 transition-colors duration-[120ms] hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5">
              <h3 className="t-h3 text-ink">Run your own numbers</h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-3">
                Answers use general examples. The calculators show what your exact amounts become.
              </p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => onNavigateToCalculators('sip')}>
                <Calculator aria-hidden="true" />
                Open calculators
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
