export type SourceDoc = {
  id: string
  title: string
  section: string
}

export type AnswerResult =
  | {
      kind: "answer"
      question: string
      answer: string
      confidence: number
      sources: SourceDoc[]
    }
  | {
      kind: "ticket"
      question: string
      confidence: number
      ticketId?: string | null
      status: string
      estimatedReview: string
      message?: string
    }
