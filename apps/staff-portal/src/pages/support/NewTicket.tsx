// apps/staff-portal/src/pages/support/NewTicket.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { useAuthStore } from "../../store/authStore";
import { createTicket } from "../../services/support.service";
import type { TicketPriority } from "../../types/support.types";

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export const NewTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user?.schoolId || !user?.id || !subject.trim() || !message.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const ticket = await createTicket({
        schoolId: user.schoolId,
        raisedBy: user.id,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        category: category.trim() || undefined,
      });
      navigate(`/support/${ticket.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper title="New Ticket">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">New Support Ticket</h2>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              disabled={submitting}
              className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              disabled={submitting}
              className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 capitalize disabled:opacity-60"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Category <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. technical, billing, account"
              disabled={submitting}
              className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={5}
              disabled={submitting}
              className="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none disabled:opacity-60"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !subject.trim() || !message.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};
