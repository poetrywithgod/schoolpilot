// apps/super-admin/src/pages/audit/AuditLogs.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getAuditLogs } from "../../services/audit.service";
import type { AuditLogWithSchool } from "../../types/audit.types";

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

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogWithSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load audit logs"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.trim().toLowerCase();
    return logs.filter(
      (log) =>
        log.actor_name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        (log.entity_label ?? "").toLowerCase().includes(q) ||
        (log.school_name ?? "").toLowerCase().includes(q)
    );
  }, [logs, search]);

  const hasDiff = (log: AuditLogWithSchool) => !!log.old_values || !!log.new_values;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            Audit Logs
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6D9773", fontFamily: "Lora, serif" }}>
            {logs.length} recent action{logs.length === 1 ? "" : "s"} across the platform
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadLogs()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#0C3B2E", color: "#F5F5F0" }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by actor, action, entity, or school..."
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border"
          style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.2)" }}
        />
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        {loading ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>
            {logs.length === 0 ? "No activity recorded yet." : "No logs match your search."}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(109,151,115,0.08)" }}>
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const expandable = hasDiff(log);
              return (
                <div key={log.id}>
                  <div
                    onClick={() => expandable && setExpandedId(isExpanded ? null : log.id)}
                    className={`flex items-center gap-3 px-5 py-3.5 ${expandable ? "cursor-pointer hover:bg-white/5" : ""} transition-colors`}
                  >
                    {expandable ? (
                      isExpanded ? (
                        <ChevronDown size={14} style={{ color: "#6D9773" }} className="shrink-0" />
                      ) : (
                        <ChevronRight size={14} style={{ color: "#6D9773" }} className="shrink-0" />
                      )
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-white font-medium">{log.actor_name}</span>
                        <span style={{ color: "#6D9773" }}>{formatLabel(log.action)}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "rgba(255,186,0,0.1)", color: "#FFBA00" }}
                        >
                          {formatLabel(log.entity_type)}
                        </span>
                        {log.entity_label && (
                          <span className="text-xs" style={{ color: "#F5F5F0" }}>{log.entity_label}</span>
                        )}
                      </div>
                      {log.school_name && (
                        <p className="text-xs mt-0.5" style={{ color: "#6D9773" }}>{log.school_name}</p>
                      )}
                    </div>

                    <span className="text-xs shrink-0" style={{ color: "#6D9773" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>

                  {isExpanded && expandable && (
                    <div
                      className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3"
                      style={{ backgroundColor: "rgba(8,31,25,0.5)" }}
                    >
                      {log.old_values && (
                        <div>
                          <p className="text-xs font-medium mb-1.5" style={{ color: "#f87171" }}>Before</p>
                          <pre
                            className="text-xs rounded-lg p-3 overflow-x-auto"
                            style={{ backgroundColor: "#081f19", color: "#F5F5F0" }}
                          >
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div>
                          <p className="text-xs font-medium mb-1.5" style={{ color: "#6D9773" }}>After</p>
                          <pre
                            className="text-xs rounded-lg p-3 overflow-x-auto"
                            style={{ backgroundColor: "#081f19", color: "#F5F5F0" }}
                          >
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
