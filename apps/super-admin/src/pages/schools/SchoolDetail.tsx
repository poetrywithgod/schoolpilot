// apps/super-admin/src/pages/schools/SchoolDetail.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
  Ban,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getSchoolById,
  suspendSchool,
  activateSchool,
  getSchoolSubscription,
  getOnboardingChecklist,
  getSchoolStaff,
  getEnrollmentTrend,
} from "../../services/school.service";
import {
  ONBOARDING_STEPS,
  type SchoolWithStats,
  type Subscription,
  type OnboardingChecklist,
  type SchoolStaffMember,
  type EnrollmentDataPoint,
} from "../../types/school.types";

export const SchoolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);

  const [school, setSchool] = useState<SchoolWithStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null);
  const [staff, setStaff] = useState<SchoolStaffMember[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadAll(id);
  }, [id]);

  const loadAll = async (schoolId: string) => {
    try {
      setLoading(true);
      const [schoolData, subData, checklistData, staffData, enrollmentData] =
        await Promise.all([
          getSchoolById(schoolId),
          getSchoolSubscription(schoolId),
          getOnboardingChecklist(schoolId),
          getSchoolStaff(schoolId),
          getEnrollmentTrend(schoolId),
        ]);
      setSchool(schoolData);
      setSubscription(subData);
      setChecklist(checklistData);
      setStaff(staffData);
      setEnrollment(enrollmentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!id || !suspendReason.trim()) return;
    try {
      setActionLoading(true);
      await suspendSchool(id, suspendReason.trim(), admin?.id ?? "", `${admin?.firstName ?? ""} ${admin?.lastName ?? ""}`.trim(), school?.name ?? "");
      await loadAll(id);
      setShowSuspendModal(false);
      setSuspendReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await activateSchool(id, admin?.id ?? "", `${admin?.firstName ?? ""} ${admin?.lastName ?? ""}`.trim(), school?.name ?? "");
      await loadAll(id);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center" style={{ color: "#6D9773" }}>
        Loading school...
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-12 text-center" style={{ color: "#6D9773" }}>
        School not found.
      </div>
    );
  }

  // Onboarding is a single row of milestone timestamps — completion is
  // "how many of the tracked milestones have a non-null timestamp."
  const completedSteps = checklist
    ? ONBOARDING_STEPS.filter((step) => !!checklist[step.key]).length
    : 0;
  const checklistPct =
    ONBOARDING_STEPS.length > 0
      ? Math.round((completedSteps / ONBOARDING_STEPS.length) * 100)
      : 0;

  return (
    <div className="pb-10">
      <button
        onClick={() => navigate("/schools")}
        className="flex items-center gap-2 text-sm mb-5 transition-colors hover:text-white"
        style={{ color: "#6D9773" }}
      >
        <ArrowLeft size={16} />
        Back to Schools
      </button>

      {/* Header */}
      <div
        className="rounded-2xl border p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: "#0C3B2E",
          borderColor: "rgba(109,151,115,0.15)",
        }}
      >
        <div className="flex items-center gap-4">
          {school.logo_url ? (
            <img
              src={school.logo_url}
              alt={school.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl"
              style={{
                backgroundColor: "rgba(255,186,0,0.15)",
                color: "#FFBA00",
              }}
            >
              {school.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {school.name}
            </h1>
            <div
              className="flex flex-wrap items-center gap-3 mt-1.5 text-xs"
              style={{ color: "#6D9773" }}
            >
              {school.email && (
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {school.email}
                </span>
              )}
              {school.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {school.phone}
                </span>
              )}
              {(school.city || school.state) && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {school.city}
                  {school.state ? `, ${school.state}` : ""}
                </span>
              )}
              {school.website && (
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  {school.website}
                </span>
              )}
            </div>
          </div>
        </div>

        {school.is_suspended ? (
          <button
            onClick={handleActivate}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "rgba(109,151,115,0.2)",
              color: "#6D9773",
            }}
          >
            <CheckCircle2 size={16} />
            Reactivate School
          </button>
        ) : (
          <button
            onClick={() => setShowSuspendModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "rgba(220,38,38,0.15)",
              color: "#f87171",
            }}
          >
            <Ban size={16} />
            Suspend School
          </button>
        )}
      </div>

      {school.is_suspended && school.suspension_reason && (
        <div
          className="rounded-xl border p-4 mb-6 text-sm"
          style={{
            backgroundColor: "rgba(220,38,38,0.08)",
            borderColor: "rgba(220,38,38,0.2)",
            color: "#f87171",
          }}
        >
          Suspended: {school.suspension_reason}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment chart */}
        <div
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{
            backgroundColor: "#0C3B2E",
            borderColor: "rgba(109,151,115,0.15)",
          }}
        >
          <h2
            className="text-sm font-semibold text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Enrollment Growth
          </h2>
          {enrollment.length === 0 ? (
            <div
              className="h-56 flex items-center justify-center text-sm"
              style={{ color: "#6D9773" }}
            >
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={enrollment}>
                <defs>
                  <linearGradient
                    id="enrollGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#FFBA00" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FFBA00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(109,151,115,0.12)"
                />
                <XAxis dataKey="year" stroke="#6D9773" fontSize={12} />
                <YAxis stroke="#6D9773" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#081f19",
                    border: "1px solid rgba(109,151,115,0.2)",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#F5F5F0" }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#FFBA00"
                  fill="url(#enrollGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subscription */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "#0C3B2E",
            borderColor: "rgba(109,151,115,0.15)",
          }}
        >
          <h2
            className="text-sm font-semibold text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Subscription
          </h2>
          {subscription ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#6D9773" }}>Plan</span>
                <span className="text-white capitalize">
                  {subscription.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#6D9773" }}>Status</span>
                <span
                  className="capitalize"
                  style={{
                    color:
                      subscription.status === "active" ? "#6D9773" : "#FFBA00",
                  }}
                >
                  {subscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#6D9773" }}>Amount</span>
                <span className="text-white">
                  ₦{(subscription.amount_naira ?? 0).toLocaleString()}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span style={{ color: "#6D9773" }}>Renews / Ends</span>
                  <span className="text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm" style={{ color: "#6D9773" }}>
              No subscription on record
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Onboarding checklist — milestone timestamps */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "#0C3B2E",
            borderColor: "rgba(109,151,115,0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Onboarding
            </h2>
            <span className="text-xs font-medium" style={{ color: "#FFBA00" }}>
              {checklistPct}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full mb-4"
            style={{ backgroundColor: "rgba(109,151,115,0.15)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${checklistPct}%`, backgroundColor: "#FFBA00" }}
            />
          </div>
          {!checklist ? (
            <div className="text-sm" style={{ color: "#6D9773" }}>
              No onboarding record yet
            </div>
          ) : (
            <ul className="space-y-2.5">
              {ONBOARDING_STEPS.map((step) => {
                const isDone = !!checklist[step.key];
                return (
                  <li
                    key={step.key}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isDone
                          ? "rgba(109,151,115,0.3)"
                          : "rgba(109,151,115,0.1)",
                      }}
                    >
                      {isDone && (
                        <CheckCircle2 size={12} style={{ color: "#6D9773" }} />
                      )}
                    </div>
                    <span style={{ color: isDone ? "#F5F5F0" : "#6D9773" }}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Staff list */}
        <div
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{
            backgroundColor: "#0C3B2E",
            borderColor: "rgba(109,151,115,0.15)",
          }}
        >
          <h2
            className="text-sm font-semibold text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Staff ({staff.length})
          </h2>
          {staff.length === 0 ? (
            <div className="text-sm" style={{ color: "#6D9773" }}>
              No staff members yet
            </div>
          ) : (
            <div className="space-y-2">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: "1px solid rgba(109,151,115,0.08)" }}
                >
                  <div>
                    <div className="text-sm text-white">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-xs" style={{ color: "#6D9773" }}>
                      {member.email}
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs capitalize"
                    style={{
                      backgroundColor: "rgba(255,186,0,0.1)",
                      color: "#FFBA00",
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suspend modal */}
      {showSuspendModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              backgroundColor: "#0C3B2E",
              borderColor: "rgba(109,151,115,0.2)",
            }}
          >
            <h3
              className="text-lg font-bold text-white mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Suspend {school.name}?
            </h3>
            <p className="text-sm mb-4" style={{ color: "#6D9773" }}>
              This will immediately block staff and student access. Provide a
              reason for the record.
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border resize-none mb-4"
              style={{
                backgroundColor: "#081f19",
                borderColor: "rgba(109,151,115,0.2)",
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: "rgba(109,151,115,0.15)",
                  color: "#F5F5F0",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: "rgba(220,38,38,0.2)",
                  color: "#f87171",
                }}
              >
                {actionLoading ? "Suspending..." : "Confirm Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
