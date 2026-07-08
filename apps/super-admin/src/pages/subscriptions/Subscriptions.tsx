// apps/super-admin/src/pages/subscriptions/Subscriptions.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Edit3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Select } from "../../components/ui/Select";
import {
  getAllSubscriptions,
  upsertSubscription,
} from "../../services/subscription.service";
import type {
  SchoolSubscriptionRow,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../types/school.types";

type FilterKey = "all" | "active" | "trial" | "expired" | "cancelled" | "none";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "trial", label: "Trial" },
  { key: "expired", label: "Expired" },
  { key: "cancelled", label: "Cancelled" },
  { key: "none", label: "No Subscription" },
];

const PLANS: SubscriptionPlan[] = ["trial", "basic", "standard", "premium"];
const STATUSES: SubscriptionStatus[] = [
  "trial",
  "active",
  "expired",
  "cancelled",
];

const DEFAULT_PLAN: SubscriptionPlan = "trial";
const DEFAULT_STATUS: SubscriptionStatus = "trial";

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

export const Subscriptions = () => {
  const [rows, setRows] = useState<SchoolSubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const [editingRow, setEditingRow] = useState<SchoolSubscriptionRow | null>(
    null,
  );
  const [formPlan, setFormPlan] = useState<SubscriptionPlan>(DEFAULT_PLAN);
  const [formStatus, setFormStatus] =
    useState<SubscriptionStatus>(DEFAULT_STATUS);
  const [formAmount, setFormAmount] = useState("0");
  const [formEndsAt, setFormEndsAt] = useState("");

  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setFormPlan(DEFAULT_PLAN);
    setFormStatus(DEFAULT_STATUS);
    setFormAmount("0");
    setFormEndsAt("");
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingRow(null);
    resetForm();
  }, [resetForm]);

  const openEditModal = useCallback((row: SchoolSubscriptionRow) => {
    setEditingRow(row);
    setFormPlan(row.plan ?? DEFAULT_PLAN);
    setFormStatus(row.status ?? DEFAULT_STATUS);
    setFormAmount(row.amount_naira != null ? String(row.amount_naira) : "0");
    setFormEndsAt(
      row.current_period_end ? row.current_period_end.slice(0, 10) : "",
    );
  }, []);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllSubscriptions();
      setRows(data);
    } catch (err) {
      console.error(err);
      const message = getErrorMessage(err, "Failed to load subscriptions");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  const filteredRows = useMemo(() => {
    let result = rows;

    if (activeFilter === "none") {
      result = result.filter((row) => !row.subscription_id);
    } else if (activeFilter !== "all") {
      result = result.filter((row) => row.status === activeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (row) =>
          row.school_name.toLowerCase().includes(q) ||
          row.school_slug.toLowerCase().includes(q),
      );
    }

    return result;
  }, [rows, search, activeFilter]);

  const totalMonthlyRevenue = useMemo(() => {
    return rows
      .filter((row) => row.status === "active")
      .reduce((sum, row) => sum + (row.amount_naira ?? 0), 0);
  }, [rows]);

  const handleSave = useCallback(async () => {
    if (!editingRow) return;

    const parsedAmount = Number(formAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid non-negative amount.");
      return;
    }

    try {
      setSaving(true);

      await upsertSubscription(
        editingRow.school_id,
        editingRow.subscription_id,
        {
          plan: formPlan,
          status: formStatus,
          amount_naira: parsedAmount,
          current_period_end: formEndsAt
            ? new Date(formEndsAt).toISOString()
            : null,
        },
      );

      toast.success(`Subscription updated for ${editingRow.school_name}.`);
      await loadSubscriptions();
      closeEditModal();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to save subscription"));
    } finally {
      setSaving(false);
    }
  }, [
    editingRow,
    formAmount,
    formEndsAt,
    formPlan,
    formStatus,
    loadSubscriptions,
    closeEditModal,
  ]);

  const getStatusBadge = (status: SubscriptionStatus | null) => {
    if (!status) {
      return (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "rgba(109,151,115,0.15)",
            color: "#6D9773",
          }}
        >
          None
        </span>
      );
    }

    const colors: Record<SubscriptionStatus, { bg: string; text: string }> = {
      active: { bg: "rgba(109,151,115,0.2)", text: "#6D9773" },
      trial: { bg: "rgba(255,186,0,0.15)", text: "#FFBA00" },
      expired: { bg: "rgba(220,38,38,0.15)", text: "#f87171" },
      cancelled: { bg: "rgba(220,38,38,0.1)", text: "#f87171" },
    };

    const color = colors[status];

    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Subscriptions
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
          >
            {rows.length} school{rows.length === 1 ? "" : "s"} · ₦
            {totalMonthlyRevenue.toLocaleString()} from active subscriptions
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSubscriptions()}
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
            placeholder="Search by school name or slug..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none border"
            style={{
              backgroundColor: "#0C3B2E",
              borderColor: "rgba(109,151,115,0.2)",
            }}
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
        style={{
          backgroundColor: "#0C3B2E",
          borderColor: "rgba(109,151,115,0.15)",
        }}
      >
        {loading ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>
            Loading subscriptions...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              type="button"
              onClick={() => void loadSubscriptions()}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
            >
              Try again
            </button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>
            No schools match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{ borderBottom: "1px solid rgba(109,151,115,0.15)" }}
                >
                  <th
                    className="text-left px-5 py-3.5 font-medium"
                    style={{ color: "#6D9773" }}
                  >
                    School
                  </th>
                  <th
                    className="text-left px-5 py-3.5 font-medium"
                    style={{ color: "#6D9773" }}
                  >
                    Plan
                  </th>
                  <th
                    className="text-left px-5 py-3.5 font-medium"
                    style={{ color: "#6D9773" }}
                  >
                    Status
                  </th>
                  <th
                    className="text-left px-5 py-3.5 font-medium"
                    style={{ color: "#6D9773" }}
                  >
                    Amount
                  </th>
                  <th
                    className="text-left px-5 py-3.5 font-medium"
                    style={{ color: "#6D9773" }}
                  >
                    Ends
                  </th>
                  <th
                    className="text-right px-5 py-3.5 font-medium"
                    style={{ color: "#6D9773" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={row.school_id}
                    style={{
                      borderBottom: "1px solid rgba(109,151,115,0.08)",
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {row.logo_url ? (
                          <img
                            src={row.logo_url}
                            alt={row.school_name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm"
                            style={{
                              backgroundColor: "rgba(255,186,0,0.15)",
                              color: "#FFBA00",
                            }}
                          >
                            {row.school_name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="text-white font-medium">
                            {row.school_name}
                          </div>
                          <div className="text-xs" style={{ color: "#6D9773" }}>
                            {row.school_slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className="px-5 py-3.5 capitalize"
                      style={{ color: "#F5F5F0" }}
                    >
                      {row.plan ?? "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      {getStatusBadge(row.status)}
                    </td>

                    <td className="px-5 py-3.5" style={{ color: "#F5F5F0" }}>
                      {row.amount_naira != null
                        ? `₦${row.amount_naira.toLocaleString()}`
                        : "—"}
                    </td>

                    <td className="px-5 py-3.5" style={{ color: "#6D9773" }}>
                      {row.current_period_end
                        ? new Date(row.current_period_end).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "rgba(255,186,0,0.1)",
                          color: "#FFBA00",
                        }}
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={saving ? undefined : closeEditModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              backgroundColor: "#0C3B2E",
              borderColor: "rgba(109,151,115,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold text-white mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {editingRow.school_name}
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "#6D9773" }}
                >
                  Plan
                </label>
                <Select
                  value={formPlan}
                  onChange={(v) => setFormPlan(v as SubscriptionPlan)}
                  disabled={saving}
                  options={PLANS.map((p) => ({ value: p, label: p }))}
                />
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "#6D9773" }}
                >
                  Status
                </label>
                <Select
                  value={formStatus}
                  onChange={(v) => setFormStatus(v as SubscriptionStatus)}
                  disabled={saving}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                />
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "#6D9773" }}
                >
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  min={0}
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                  style={{
                    backgroundColor: "#081f19",
                    borderColor: "rgba(109,151,115,0.2)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs mb-1.5"
                  style={{ color: "#6D9773" }}
                >
                  Ends On
                </label>
                <input
                  type="date"
                  value={formEndsAt}
                  onChange={(e) => setFormEndsAt(e.target.value)}
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                  style={{
                    backgroundColor: "#081f19",
                    borderColor: "rgba(109,151,115,0.2)",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: "rgba(109,151,115,0.15)",
                  color: "#F5F5F0",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
