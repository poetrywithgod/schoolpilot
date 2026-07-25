// apps/staff-portal/src/components/layout/BroadcastBanner.tsx

import { useEffect, useState } from "react";
import { X, Info, AlertTriangle, Wrench, Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getActiveBroadcastsForSchool } from "../../services/broadcast.service";
import type { ActiveBroadcast, BroadcastType } from "../../types/broadcast.types";

const DISMISSED_KEY = "schoolpilot-dismissed-broadcasts";

const TYPE_STYLES: Record<BroadcastType, { bg: string; text: string; icon: typeof Info }> = {
  info: { bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400", icon: Info },
  warning: { bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", icon: AlertTriangle },
  maintenance: { bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400", icon: Wrench },
  feature: { bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-400", icon: Sparkles },
};

const getDismissedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addDismissedId = (id: string) => {
  const current = getDismissedIds();
  if (!current.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
  }
};

export const BroadcastBanner = () => {
  const { user } = useAuthStore();
  const [broadcasts, setBroadcasts] = useState<ActiveBroadcast[]>([]);

  useEffect(() => {
    if (!user?.schoolId) return;
    getActiveBroadcastsForSchool(user.schoolId)
      .then((data) => {
        const dismissed = getDismissedIds();
        setBroadcasts(data.filter((b) => !dismissed.includes(b.id)));
      })
      .catch((err) => console.error("Failed to load broadcasts", err));
  }, [user?.schoolId]);

  const handleDismiss = (id: string) => {
    addDismissedId(id);
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  };

  if (broadcasts.length === 0) return null;

  return (
    <div className="px-6 pt-4 space-y-2">
      {broadcasts.map((broadcast) => {
        const style = TYPE_STYLES[broadcast.type] ?? TYPE_STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={broadcast.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${style.bg}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${style.text}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${style.text}`}>{broadcast.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{broadcast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(broadcast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
