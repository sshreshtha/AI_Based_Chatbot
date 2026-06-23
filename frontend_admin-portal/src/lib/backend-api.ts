const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type AdminOverviewResponse = {
  health: {
    status: string;
    database: string;
    services: {
      nlp: string;
      embedding_model: string;
      gemini_configured: boolean;
      vector_index: string;
    };
  };
  collections: Record<string, number>;
  recent_queries: Array<{
    query: string;
    mapped_topic: string | null;
    similarity_score: number;
    frequency: number;
    timestamp: string;
  }>;
  recent_tickets: Array<{
    ticket_id: string;
    question: string;
    email: string | null;
    status: string;
    created_at: string;
    session_id: string | null;
  }>;
};

export type TicketRecord = {
  ticket_id: string;
  question: string;
  email: string | null;
  status: string;
  created_at: string;
  resolved_at?: string | null;
  session_id: string | null;
};

export type ResolveTicketResponse = {
  ticket_id: string;
  status: string;
  email_sent: boolean;
  stored_in_admin_resolutions: boolean;
  resolved_at: string;
};

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${DEFAULT_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchAdminOverview() {
  return readJson<AdminOverviewResponse>("/api/chat/admin/overview");
}

export async function fetchTickets(limit = 20) {
  return readJson<TicketRecord[]>(`/api/chat/tickets?limit=${limit}`);
}

export async function resolveTicket(ticketId: string, answer: string, resolvedBy = "admin") {
  const response = await fetch(`${DEFAULT_BASE_URL}/api/chat/tickets/${ticketId}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answer,
      resolved_by: resolvedBy,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resolve failed: ${response.status}`);
  }
  return response.json() as Promise<ResolveTicketResponse>;
}
