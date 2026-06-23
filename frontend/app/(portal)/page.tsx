"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"
import { Search, Mic, History, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuickAccess } from "@/components/dashboard/quick-access"
import { AiResponse, TypingIndicator } from "@/components/dashboard/ai-response"
import { recentQuestions, suggestedTopics } from "@/lib/portal-data"
import { queryChatbot } from "@/lib/chat-api"
import type { AnswerResult } from "@/lib/mock-answer"

export default function DashboardPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const inputRef = useRef<HTMLInputElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)

  const ask = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setResult(null)
    setLoading(true)
    const response = await queryChatbot({ query: trimmed, sessionId })
    setResult(response)
    setLoading(false)
    requestAnimationFrame(() =>
      responseRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    )
  }

  const focusSearch = () => {
    inputRef.current?.focus()
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="stagger-soft flex flex-col gap-10">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="ntpc-card overflow-hidden rounded-xl border border-primary/10 bg-card/92"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="animate-logo-breathe mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Welcome to NTPC support
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ask anything about joining, induction, training, safety, or HR
                procedures. The assistant is set up for new joinees and trainees.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden border-primary/10 bg-secondary text-secondary-foreground sm:inline-flex">
            Calm NTPC workspace
          </Badge>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Start here
            </p>
            <p className="mt-1 text-sm text-foreground">
              Joining documents, ID setup, and first-day guidance.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Helpful
            </p>
            <p className="mt-1 text-sm text-foreground">
              Training schedules, safety basics, and plant familiarization.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ask casually
            </p>
            <p className="mt-1 text-sm text-foreground">
              Short questions work best. Try one topic at a time.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Hero + search */}
      <section className="flex flex-col items-center gap-6 pt-2 text-center">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="secondary" className="ntpc-sheen gap-1.5 border-primary/10 bg-accent text-accent-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            NTPC onboarding assistant
          </Badge>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Ask common questions as you get started
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Get quick guidance on joining formalities, HR policies, safety
            basics, training processes, and everyday NTPC procedures.
          </p>
        </div>

        <form
          className="animate-soft-rise flex w-full max-w-2xl flex-col gap-3 rounded-xl border border-primary/10 bg-card/82 p-2 shadow-[0_18px_48px_rgb(0_135_201/9%)] backdrop-blur sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            ask(query)
          }}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about joining, training, leave, safety..."
              aria-label="Ask a question"
              className="h-12 border-transparent bg-transparent pl-10 pr-11 text-base shadow-none transition-shadow duration-200 focus-visible:shadow-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Voice search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <Mic className="size-5" />
            </Button>
          </div>
          <Button
            type="submit"
            size="lg"
            className="ntpc-sheen h-12 px-6 shadow-[0_10px_24px_rgb(0_135_201/20%)]"
            disabled={loading}
          >
            <Search data-icon="inline-start" />
            Ask Question
          </Button>
        </form>

        {/* Suggested topics */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestedTopics.map((topic) => (
            <motion.button
              key={topic}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              onClick={() => ask(`Tell me about ${topic.toLowerCase()}`)}
              className="rounded-full border border-primary/15 bg-card/88 px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
            >
              {topic}
            </motion.button>
          ))}
        </div>
      </section>

      {/* AI response / loading area */}
      {(loading || result) && (
        <section ref={responseRef} className="mx-auto w-full max-w-2xl scroll-mt-20">
          {loading ? <TypingIndicator /> : result && <AiResponse result={result} />}
        </section>
      )}

      {/* Quick access */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
        <QuickAccess onAskFocus={focusSearch} />
      </section>

      {/* Recent questions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Questions
        </h2>
        <Card className="ntpc-card border-border bg-card/92">
          <CardContent className="p-2">
            <ul className="flex flex-col">
              {recentQuestions.map((rq, i) => (
                <li key={rq.id}>
                  <button
                    type="button"
                    onClick={() => ask(rq.question)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-all duration-200 hover:translate-x-0.5 hover:bg-secondary"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                      <History className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {rq.question}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rq.time}
                      </span>
                    </span>
                  </button>
                  {i < recentQuestions.length - 1 && (
                    <div className="mx-3 border-t border-border" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
