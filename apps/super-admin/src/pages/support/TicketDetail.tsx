// apps/super-admin/src/pages/support/TicketDetail.tsx

import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, UserPlus, UserMinus, Lock } from "lucide-react";
import { toast } from "sonner";
import { Select } from "../../components/ui/Select";
import { useAuthStore } from "../../store/authStore";
import {
  getTicketById,
  getTicketMessages,
  sendReply,
  updateTicketStatus,
  assignTicket,
} from "../../services/support.service";
import type {
  SupportTicketWithDetails,
  SupportMessageWithSender,
  TicketStatus,
  TicketPriority,
} from "../../types/support.types";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_COLORS: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: "rgba(109,151,115,0.15)", text: "#6D9773" },
  medium: { bg: "rgba(255,186,0,0.1)", text: "#FFBA00" },
  high: { bg: "rgba(220,38,38,0.1)", text: "#f87171" },
  urgent: { bg: "rgba(220,38,38,0.2)", text: "#f87171" },
};

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

export const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);

  const [ticket, setTicket] = useState<SupportTicketWithDetails | null>(null);
  const [messages, setMessages] = useState<SupportMessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assignUpdating, setAssignUpdating] = useState(false);

  const loadAll = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const [ticketData, messagesData] = await Promise.all([
        getTicketById(id),
        getTicketMessages(id),
      ]);
      setTicket(ticketData);
      setMessages(messagesData);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load ticket"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ticketId) void loadAll(ticketId);
  }, [ticketId, loadAll]);

  const handleStatusChange = async (status: string) => {
    if (!ticketId) return;
    try {
      setStatusUpdating(true);
      await updateTicketStatus(ticketId, status as TicketStatus);
      await loadAll(ticketId);
      toast.success("Ticket status updated.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update status"));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!ticketId || !admin) return;
    try {
      setAssignUpdating(true);
      await assignTicket(ticketId, admin.id);
      await loadAll(ticketId);
      toast.success("Ticket assigned to you.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to assign ticket"));
    } finally {
      setAssignUpdating(false);
    }
  };

  const handleUnassign = async () => {
    if (!ticketId) return;
    try {
      setAssignUpdating(true);
      await assignTicket(ticketId, null);
      await loadAll(ticketId);
      toast.success("Ticket unassigned.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to unassign ticket"));
    } finally {
      setAssignUpdating(false);
    }
  };

  const handleSendReply = async () => {
    if (!ticketId || !admin || !replyText.trim()) return;
    try {
      setSending(true);
      await sendReply(ticketId, admin.id, replyText.trim(), isInternal);
      setReplyText("");
      setIsInternal(false);
      await loadAll(ticketId);
      toast.success(isInternal ? "Internal note added." : "Reply sent.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to send reply"));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center" style={{ color: "#6D9773" }}>Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="p-12 text-center" style={{ color: "#6D9773" }}>Ticket not found.</div>;
  }

  const isAssignedToMe = admin && ticket.assigned_to === admin.id;

  return (
    <div className="pb-10">
      <button
        type="button"
        onClick={() => navigate("/support")}
        className="flex items-center gap-2 text-sm mb-5 transition-colors hover:text-white"
        style={{ color: "#6D9773" }}
      >
        <ArrowLeft size={16} />
        Back to Tickets
      </button>

      <div
        className="rounded-2xl border p-6 mb-6"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                style={{
                  backgroundColor: PRIORITY_COLORS[ticket.priority]?.bg ?? "rgba(109,151,115,0.15)",
                  color: PRIORITY_COLORS[ticket.priority]?.text ?? "#6D9773",
                }}
              >
                {ticket.priority}
              </span>
              <span className="text-xs" style={{ color: "#6D9773" }}>{ticket.ticket_number}</span>
            </div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
              {ticket.subject}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6D9773" }}>
              {ticket.school_name} · Raised by {ticket.raised_by_name} ·{" "}
              {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-56 shrink-0">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Status</label>
              <Select
                value={ticket.status}
                onChange={handleStatusChange}
                disabled={statusUpdating}
                options={STATUS_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Assigned to</label>
              {ticket.assigned_to_name ? (
                <div
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm border"
                  style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)", color: "#F5F5F0" }}
                >
                  <span>{ticket.assigned_to_name}</span>
                  {isAssignedToMe && (
                    <button
                      type="button"
                      onClick={() => void handleUnassign()}
                      disabled={assignUpdating}
                      className="disabled:opacity-50"
                      style={{ color: "#6D9773" }}
                      title="Unassign"
                    >
                      <UserMinus size={15} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleAssignToMe()}
                  disabled={assignUpdating || !admin}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: "rgba(255,186,0,0.1)", color: "#FFBA00" }}
                >
                  <UserPlus size={15} />
                  Assign to me
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-6 mb-6"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          Conversation ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <div className="text-sm py-8 text-center" style={{ color: "#6D9773" }}>
            No messages yet.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isAdminMsg = msg.sender_type === "super_admin";
              return (
                <div
                  key={msg.id}
                  className="flex flex-col rounded-xl p-4 max-w-[85%]"
                  style={{
                    marginLeft: isAdminMsg ? "auto" : "0",
                    backgroundColor: msg.is_internal
                      ? "rgba(255,186,0,0.08)"
                      : isAdminMsg
                      ? "rgba(109,151,115,0.15)"
                      : "#081f19",
                    border: msg.is_internal ? "1px solid rgba(255,186,0,0.2)" : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium" style={{ color: "#F5F5F0" }}>
                      {msg.sender_name}
                    </span>
                    {msg.is_internal && (
                      <span
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: "rgba(255,186,0,0.15)", color: "#FFBA00" }}
                      >
                        <Lock size={9} />
                        Internal
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: "#6D9773" }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "#F5F5F0" }}>
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={isInternal ? "Write an internal note (not visible to the school)..." : "Write a reply..."}
          rows={4}
          disabled={sending}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border resize-none disabled:opacity-60"
          style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
        />

        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#6D9773" }}>
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              disabled={sending}
              className="accent-current"
            />
            Internal note (not visible to school)
          </label>

          <button
            type="button"
            onClick={() => void handleSendReply()}
            disabled={sending || !replyText.trim() || !admin}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
          >
            <Send size={15} />
            {sending ? "Sending..." : isInternal ? "Add Note" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};
