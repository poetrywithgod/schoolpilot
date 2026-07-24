// apps/staff-portal/src/pages/support/TicketDetail.tsx

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { useAuthStore } from "../../store/authStore";
import {
  getTicketById,
  getTicketMessages,
  sendMessage,
} from "../../services/support.service";
import type {
  SupportTicket,
  SupportMessageWithSender,
  TicketStatus,
  TicketPriority,
} from "../../types/support.types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const loadAll = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);
      const [ticketData, messagesData] = await Promise.all([
        getTicketById(ticketId),
        getTicketMessages(ticketId),
      ]);
      setTicket(ticketData);
      setMessages(messagesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) void loadAll(id);
  }, [id, loadAll]);

  const handleSend = async () => {
    if (!id || !user?.id || !replyText.trim()) return;
    try {
      setSending(true);
      await sendMessage(id, user.id, replyText.trim());
      setReplyText("");
      await loadAll(id);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Support">
        <div className="p-12 text-center text-gray-400">Loading ticket...</div>
      </PageWrapper>
    );
  }

  if (!ticket) {
    return (
      <PageWrapper title="Support">
        <div className="p-12 text-center text-gray-400">Ticket not found.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Support">
      <div className="max-w-3xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
              {formatLabel(ticket.status)}
            </span>
            <span className="text-xs text-gray-400">{ticket.ticket_number}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Raised {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Conversation ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">No messages yet.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isStaffMsg = msg.sender_type === "school";
                return (
                  <div
                    key={msg.id}
                    className="flex flex-col max-w-[85%]"
                    style={{ marginLeft: isStaffMsg ? "auto" : "0" }}
                  >
                    <div
                      className={`rounded-xl p-4 ${
                        isStaffMsg
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {msg.sender_name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {ticket.status !== "closed" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={4}
              disabled={sending}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
            />
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={sending || !replyText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                <Send size={15} />
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
