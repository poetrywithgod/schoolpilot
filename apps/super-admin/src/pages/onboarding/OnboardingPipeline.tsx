// apps/super-admin/src/pages/onboarding/OnboardingPipeline.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getOnboardingPipeline } from "../../services/school.service";
import {
  ONBOARDING_STAGE_LABELS,
  type OnboardingPipelineCard,
  type OnboardingStage,
} from "../../types/school.types";

const STAGE_ORDER: OnboardingStage[] = [
  "not_started",
  "setting_up",
  "adding_data",
  "getting_active",
  "fully_live",
];

const STAGE_ACCENTS: Record<OnboardingStage, string> = {
  not_started: "#6D9773",
  setting_up: "#FFBA00",
  adding_data: "#FFBA00",
  getting_active: "#6D9773",
  fully_live: "#6D9773",
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

export const OnboardingPipeline = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<OnboardingPipelineCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPipeline = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOnboardingPipeline();
      setCards(data);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load onboarding pipeline"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPipeline();
  }, [loadPipeline]);

  const cardsByStage = (stage: OnboardingStage) =>
    cards.filter((c) => c.stage === stage);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            Onboarding Pipeline
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6D9773", fontFamily: "Lora, serif" }}>
            {cards.length} school{cards.length === 1 ? "" : "s"} across the onboarding journey
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadPipeline()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#0C3B2E", color: "#F5F5F0" }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center" style={{ color: "#6D9773" }}>
          Loading pipeline...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STAGE_ORDER.map((stage) => {
            const stageCards = cardsByStage(stage);
            return (
              <div key={stage} className="min-w-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {ONBOARDING_STAGE_LABELS[stage]}
                  </h2>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: "rgba(109,151,115,0.15)", color: "#6D9773" }}
                  >
                    {stageCards.length}
                  </span>
                </div>

                <div
                  className="rounded-2xl border p-2.5 min-h-[120px] space-y-2.5"
                  style={{ backgroundColor: "rgba(12,59,46,0.4)", borderColor: "rgba(109,151,115,0.12)" }}
                >
                  {stageCards.length === 0 ? (
                    <div className="text-xs text-center py-6" style={{ color: "#6D9773" }}>
                      No schools here
                    </div>
                  ) : (
                    stageCards.map((card) => {
                      const pct = card.total_steps > 0
                        ? Math.round((card.completed_steps / card.total_steps) * 100)
                        : 0;
                      return (
                        <div
                          key={card.school_id}
                          onClick={() => navigate(`/schools/${card.school_id}`)}
                          className="cursor-pointer rounded-xl border p-3.5 transition-colors hover:bg-white/5"
                          style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
                        >
                          <div className="flex items-center gap-2.5 mb-2.5">
                            {card.logo_url ? (
                              <img src={card.logo_url} alt={card.school_name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs shrink-0"
                                style={{ backgroundColor: "rgba(255,186,0,0.15)", color: "#FFBA00" }}
                              >
                                {card.school_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium text-white truncate">{card.school_name}</span>
                          </div>

                          <div className="w-full h-1 rounded-full mb-1.5" style={{ backgroundColor: "rgba(109,151,115,0.15)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: STAGE_ACCENTS[stage] }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px]" style={{ color: "#6D9773" }}>
                            <span>{card.completed_steps}/{card.total_steps} steps</span>
                            <span>{pct}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
