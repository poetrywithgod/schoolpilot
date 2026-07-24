// apps/super-admin/src/pages/support/SupportTickets.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getAllTickets } from "../../services/support.service";
import type {
  SupportTicketWithDetails,
  TicketStatus,
  TicketPriority,
} from "../../types/support.types";

type FilterKey = "all" | TicketStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

const STATUS_COLORS: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: "rgba(255,186,0,0.15)", text: "#FFBA00" },
  in_progress: { bg: "rgba(109,151,115,0.2)", text: "#6D9773" },
  resolved: { bg: "rgba(109,151,115,0.15)", text: "#6D9773" },
  closed: { bg: "rgba(109,151,115,0.1)", text: "#6D9773" },
};

const PRIORITY_COLORS: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: "rgba(109,151,115,0.15)", text: "#6D9773" },
  medium: { bg: "rgba(255,186,0,0.1)", text: "#FFBA00" },
  high: { bg: "rgba(220,38,38,0.1)", text: "#f87171" },
  urgent: { bg: "rgba(220,38,38,0.2)", text: "#f87171" },
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
      const message = getErrorMessage(err, "Failed to load support tickets");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    let result = tickets;

    if (activeFilter !== "all") {
      result = result.filter((t) => t.status === activeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticket_number.toLowerCase().includes(q) ||
          t.school_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tickets, search, activeFilter]);

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Support Tickets
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
          >
            {tickets.length} ticket{tickets.length === 1 ? "" : "s"} · {openCount} open
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTickets()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#0C3B2E", color: "#F5F5F0" }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "#6D9773" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, ticket #, or school..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none border"
            style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.2)" }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={
                activeFilter === filter.key
                  ? { backgroundColor: "#FFBA00", color: "#081f19" }
                  : { backgroundColor: "#0C3B2E", color: "#F5F5F0" }
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        {loading ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>
            Loading tickets...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              type="button"
              onClick={() => void loadTickets()}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
            >
              Try again
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>
            No tickets match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(109,151,115,0.15)" }}>
                  <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Ticket</th>
                  <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>School</th>
                  <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Priority</th>
                  <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Status</th>
                  <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Assigned</th>
                  <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/support/${ticket.id}`)}
                    className="cursor-pointer transition-colors hover:bg-white/5"
                    style={{ borderBottom: "1px solid rgba(109,151,115,0.08)" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-white font-medium">{ticket.subject}</div>
                      <div className="text-xs" style={{ color: "#6D9773" }}>{ticket.ticket_number}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {ticket.logo_url ? (
                          <img src={ticket.logo_url} alt={ticket.school_name} className="w-7 h-7 rounded-md object-cover" />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center font-semibold text-xs"
                            style={{ backgroundColor: "rgba(255,186,0,0.15)", color: "#FFBA00" }}
                          >
                            {ticket.school_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ color: "#F5F5F0" }}>{ticket.school_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: PRIORITY_COLORS[ticket.priority]?.bg ?? "rgba(109,151,115,0.15)",
                          color: PRIORITY_COLORS[ticket.priority]?.text ?? "#6D9773",
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: STATUS_COLORS[ticket.status]?.bg ?? "rgba(109,151,115,0.15)",
                          color: STATUS_COLORS[ticket.status]?.text ?? "#6D9773",
                        }}
                      >
                        {formatLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "#6D9773" }}>
                      {ticket.assigned_to_name ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "#6D9773" }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
