// apps/super-admin/src/pages/broadcasts/Broadcasts.tsx

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Radio } from "lucide-react";
import { toast } from "sonner";
import { Select } from "../../components/ui/Select";
import { useAuthStore } from "../../store/authStore";
import {
  getBroadcasts,
  createBroadcast,
  setBroadcastPublished,
  deleteBroadcast,
} from "../../services/broadcast.service";
import { getSchools } from "../../services/school.service";
import type { BroadcastWithSender, BroadcastTarget, BroadcastType } from "../../types/broadcast.types";
import type { SchoolWithStats } from "../../types/school.types";

const TYPE_OPTIONS: { value: BroadcastType; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "maintenance", label: "Maintenance" },
  { value: "feature", label: "Feature" },
];

const TARGET_OPTIONS: { value: BroadcastTarget; label: string }[] = [
  { value: "all_schools", label: "All Schools" },
  { value: "active_only", label: "Active Subscriptions Only" },
  { value: "trial_only", label: "Trial Schools Only" },
  { value: "specific_schools", label: "Specific Schools" },
];

const TYPE_COLORS: Record<BroadcastType, { bg: string; text: string }> = {
  info: { bg: "rgba(109,151,115,0.2)", text: "#6D9773" },
  warning: { bg: "rgba(255,186,0,0.15)", text: "#FFBA00" },
  maintenance: { bg: "rgba(220,38,38,0.15)", text: "#f87171" },
  feature: { bg: "rgba(109,151,115,0.15)", text: "#6D9773" },
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

export const Broadcasts = () => {
  const admin = useAuthStore((s) => s.admin);
  const [broadcasts, setBroadcasts] = useState<BroadcastWithSender[]>([]);
  const [schools, setSchools] = useState<SchoolWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<BroadcastType>("info");
  const [target, setTarget] = useState<BroadcastTarget>("all_schools");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [broadcastData, schoolData] = await Promise.all([getBroadcasts(), getSchools()]);
      setBroadcasts(broadcastData);
      setSchools(schoolData);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load broadcasts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setType("info");
    setTarget("all_schools");
    setSelectedSchoolIds([]);
    setExpiresAt("");
  };

  const toggleSchool = (id: string) => {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreate = async (publishNow: boolean) => {
    if (!admin || !title.trim() || !body.trim()) return;
    if (target === "specific_schools" && selectedSchoolIds.length === 0) {
      toast.error("Select at least one school.");
      return;
    }
    try {
      setCreating(true);
      await createBroadcast({
        sentBy: admin.id,
        sentByName: `${admin.firstName} ${admin.lastName}`.trim(),
        title: title.trim(),
        body: body.trim(),
        target,
        targetSchoolIds: target === "specific_schools" ? selectedSchoolIds : null,
        type,
        expiresAt: expiresAt ? new Date(expiresAt + 'T23:59:59').toISOString() : null,
        publishNow,
      });
      toast.success(publishNow ? "Broadcast published." : "Draft saved.");
      resetForm();
      setShowModal(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to create broadcast"));
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (broadcast: BroadcastWithSender) => {
    if (!admin) return;
    try {
      setUpdatingId(broadcast.id);
      await setBroadcastPublished(
        broadcast.id,
        !broadcast.is_published,
        admin.id,
        `${admin.firstName} ${admin.lastName}`.trim(),
        broadcast.title
      );
      await loadAll();
      toast.success(broadcast.is_published ? "Unpublished." : "Published.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update broadcast"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (broadcast: BroadcastWithSender) => {
    if (!admin) return;
    if (!confirm("Delete this broadcast? This cannot be undone.")) return;
    try {
      setUpdatingId(broadcast.id);
      await deleteBroadcast(
        broadcast.id,
        admin.id,
        `${admin.firstName} ${admin.lastName}`.trim(),
        broadcast.title
      );
      await loadAll();
      toast.success("Broadcast deleted.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to delete broadcast"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            Broadcasts
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6D9773", fontFamily: "Lora, serif" }}>
            {broadcasts.length} broadcast{broadcasts.length === 1 ? "" : "s"} sent to schools
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadAll()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#0C3B2E", color: "#F5F5F0" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
          >
            <Plus size={16} />
            New Broadcast
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        {loading ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>Loading broadcasts...</div>
        ) : broadcasts.length === 0 ? (
          <div className="p-12 text-center">
            <Radio size={32} className="mx-auto mb-3" style={{ color: "#6D9773" }} />
            <p style={{ color: "#6D9773" }}>No broadcasts yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(109,151,115,0.08)" }}>
            {broadcasts.map((b) => (
              <div key={b.id} className="p-5" style={{ borderColor: "rgba(109,151,115,0.08)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                        style={{ backgroundColor: TYPE_COLORS[b.type]?.bg, color: TYPE_COLORS[b.type]?.text }}
                      >
                        {b.type}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={
                          b.is_published
                            ? { backgroundColor: "rgba(109,151,115,0.2)", color: "#6D9773" }
                            : { backgroundColor: "rgba(109,151,115,0.1)", color: "#6D9773" }
                        }
                      >
                        {b.is_published ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs" style={{ color: "#6D9773" }}>
                        {b.target === "all_schools" ? "All Schools" : `${b.target_school_ids?.length ?? 0} school(s)`}
                      </span>
                    </div>
                    <h3 className="text-white font-medium mb-1">{b.title}</h3>
                    <p className="text-sm" style={{ color: "#F5F5F0" }}>{b.body}</p>
                    <p className="text-xs mt-2" style={{ color: "#6D9773" }}>
                      By {b.sent_by_name} · {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleTogglePublish(b)}
                      disabled={updatingId === b.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "rgba(255,186,0,0.1)", color: "#FFBA00" }}
                    >
                      {b.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(b)}
                      disabled={updatingId === b.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#f87171" }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-lg rounded-2xl border p-6 max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.2)" }}
          >
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              New Broadcast
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                disabled={creating}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message"
                rows={4}
                disabled={creating}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border resize-none disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Type</label>
                  <Select value={type} onChange={(v) => setType(v as BroadcastType)} disabled={creating} options={TYPE_OPTIONS} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Send to</label>
                  <Select value={target} onChange={(v) => setTarget(v as BroadcastTarget)} disabled={creating} options={TARGET_OPTIONS} />
                </div>
              </div>

              {target === "specific_schools" && (
                <div
                  className="rounded-xl border p-3 max-h-40 overflow-y-auto space-y-1.5"
                  style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
                >
                  {schools.length === 0 ? (
                    <p className="text-xs" style={{ color: "#6D9773" }}>No schools available</p>
                  ) : (
                    schools.map((school) => (
                      <label key={school.id} className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: "#F5F5F0" }}>
                        <input
                          type="checkbox"
                          checked={selectedSchoolIds.includes(school.id)}
                          onChange={() => toggleSchool(school.id)}
                          disabled={creating}
                          className="accent-current"
                        />
                        {school.name}
                      </label>
                    ))
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>
                  Expires On <span className="font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                  style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "rgba(109,151,115,0.15)", color: "#F5F5F0" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreate(false)}
                disabled={creating || !title.trim() || !body.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "rgba(109,151,115,0.15)", color: "#F5F5F0" }}
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => void handleCreate(true)}
                disabled={creating || !title.trim() || !body.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
              >
                {creating ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
