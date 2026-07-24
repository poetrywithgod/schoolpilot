// apps/staff-portal/src/pages/support/SupportList.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LifeBuoy } from "lucide-react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { useAuthStore } from "../../store/authStore";
import { getMyTickets } from "../../services/support.service";
import type { SupportTicket, TicketStatus, TicketPriority } from "../../types/support.types";

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

export const SupportList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    if (!user?.schoolId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMyTickets(user.schoolId);
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  return (
    <PageWrapper title="Support">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Support</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tickets.length} ticket{tickets.length === 1 ? "" : "s"} raised by your school
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/support/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={16} />
            New Ticket
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 text-sm">{error}</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <LifeBuoy size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">No support tickets yet.</p>
              <button
                type="button"
                onClick={() => navigate("/support/new")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Raise your first ticket
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Ticket</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/support/${ticket.id}`)}
                    className="cursor-pointer border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900 dark:text-white">{ticket.subject}</div>
                      <div className="text-xs text-gray-400">{ticket.ticket_number}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
                        {formatLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
