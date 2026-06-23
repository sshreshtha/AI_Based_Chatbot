import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Target,
  TicketCheck,
  Gauge,
  TrendingUp,
  AlertCircle,
  Sparkles,
  FileText,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { KpiCard, PageHeader, SectionCard } from "@/components/admin-ui";
import { cn } from "@/lib/utils";
import {
  fetchAdminOverview,
  fetchAnalytics,
  BackendApiError,
  type AdminOverviewResponse,
  type AnalyticsRecord,
} from "@/lib/backend-api";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics - NTPC Control Center" }] }),
  component: AnalyticsPage,
});

const ranges = ["Today", "7 days", "30 days", "90 days", "Custom"];

const chartTheme = {
  grid: "var(--color-border)",
  axis: "var(--color-muted-foreground)",
  primary: "var(--color-primary)",
};

const pieColors = [
  "var(--color-primary)",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

function AnalyticsPage() {
  const [range, setRange] = useState("30 days");
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [overviewData, analyticsData] = await Promise.all([
          fetchAdminOverview(),
          fetchAnalytics(20),
        ]);
        if (active) {
          setOverview(overviewData);
          setAnalytics(analyticsData);
          setLoadError(null);
        }
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof BackendApiError
              ? err.message
              : "Analytics backend unavailable",
          );
        }
      }
    };
    load();
    const id = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const queryRecords = overview?.analytics_count ?? 0;
  const totalTickets = overview?.total_tickets ?? 0;
  const pendingTickets = overview?.pending_tickets ?? 0;
  const resolvedTickets = overview?.resolved_tickets ?? 0;
  const ticketRate =
    totalTickets + queryRecords > 0
      ? `${((totalTickets / (totalTickets + queryRecords)) * 100).toFixed(1)}%`
      : "0%";
  const avgConfidence =
    analytics.length > 0
      ? (
          analytics.reduce((sum, item) => sum + item.similarity_score, 0) /
          analytics.length
        ).toFixed(2)
      : "—";

  const queryTrend = useMemo(
    () =>
      analytics.slice(0, 14).map((item, index) => ({
        day: `Q${index + 1}`,
        value: item.frequency,
      })),
    [analytics],
  );

  const topicBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of analytics) {
      const topic = item.mapped_topic ?? "Unmapped";
      counts.set(topic, (counts.get(topic) ?? 0) + item.frequency);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [analytics]);

  const ticketTrend = [
    { day: "Pending", resolved: resolvedTickets, escalated: pendingTickets },
  ];

  const confidence = analytics.slice(0, 10).map((item, index) => ({
    bucket: `${index * 10}-${index * 10 + 10}`,
    count: Math.round(item.similarity_score * 100),
  }));

  const insights = [
    {
      icon: TrendingUp,
      label: "Most searched",
      text: analytics[0]?.query ?? "No query analytics yet",
    },
    {
      icon: AlertCircle,
      label: "Pending tickets",
      text: `${pendingTickets} unresolved user question${pendingTickets === 1 ? "" : "s"}`,
    },
    {
      icon: Sparkles,
      label: "Knowledge base",
      text: `${overview?.knowledge_base_count ?? 0} chunks and resolutions indexed`,
    },
    {
      icon: FileText,
      label: "Top topic",
      text: topicBreakdown[0]?.name ?? "No mapped topics yet",
    },
  ];

  return (
    <div className="stagger-soft mx-auto w-full max-w-[1600px] p-4 sm:p-6">
      <PageHeader
        title="Analytics Dashboard"
        subtitle={loadError ?? "Live query analytics and ticket metrics from MongoDB."}
      >
        <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-md">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-sm transition-colors",
                range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={MessageSquare} label="Total Queries" value={queryRecords.toString()} trend={{ value: 0 }} delay={0} />
        <KpiCard icon={Target} label="Resolved Tickets" value={resolvedTickets.toString()} trend={{ value: 0 }} delay={0.05} />
        <KpiCard icon={TicketCheck} label="Ticket Creation Rate" value={ticketRate} trend={{ value: 0 }} delay={0.1} />
        <KpiCard icon={Gauge} label="Avg. Confidence" value={avgConfidence} trend={{ value: 0 }} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 sm:mt-6">
        <SectionCard title="Query Frequency" className="lg:col-span-2">
          <div className="h-64">
            {queryTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={queryTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="day" stroke={chartTheme.axis} fontSize={12} />
                  <YAxis stroke={chartTheme.axis} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                  <Line type="monotone" dataKey="value" stroke={chartTheme.primary} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No query analytics recorded yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Top Knowledge Topics">
          <div className="h-64">
            {topicBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topicBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {topicBreakdown.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No topic mapping data yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 sm:mt-6">
        <SectionCard title="Ticket Status">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="day" stroke={chartTheme.axis} fontSize={12} />
                <YAxis stroke={chartTheme.axis} fontSize={12} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="resolved" fill={chartTheme.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="escalated" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Confidence Score Distribution">
          <div className="h-60">
            {confidence.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={confidence}>
                  <defs>
                    <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis dataKey="bucket" stroke={chartTheme.axis} fontSize={11} />
                  <YAxis stroke={chartTheme.axis} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid var(--color-border)" }} />
                  <Area type="monotone" dataKey="count" stroke={chartTheme.primary} strokeWidth={2} fill="url(#cf)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No confidence scores yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 sm:mt-6">
        <SectionCard title="Most Asked Questions" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 px-3 font-medium">Query</th>
                  <th className="py-2 px-3 font-medium">Topic</th>
                  <th className="py-2 px-3 font-medium text-right">Frequency</th>
                  <th className="py-2 px-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item, index) => (
                  <tr key={`${item.query}-${index}`} className="border-b border-border last:border-0">
                    <td className="py-2.5 px-3 text-foreground">{item.query}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.mapped_topic ?? "—"}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.frequency}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{item.similarity_score.toFixed(2)}</td>
                  </tr>
                ))}
                {analytics.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No analytics records in query_analytics yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Insights">
          <ul className="space-y-3">
            {insights.map((i, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md border border-border">
                <i.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{i.label}</p>
                  <p className="text-sm text-foreground mt-0.5">{i.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
