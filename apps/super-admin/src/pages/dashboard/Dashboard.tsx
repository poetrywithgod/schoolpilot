import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "../../lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface KPIData {
  totalSchools: number;
  totalStudents: number;
  totalStaff: number;
  trialSchools: number;
  activeSchools: number;
  expiringSoon: number;
  openTickets: number;
  totalParents: number;
}

interface ActivityItem {
  id: string;
  actor_name: string;
  action: string;
  entity_label: string | null;
  created_at: string;
}

interface SchoolRow {
  id: string;
  name: string;
  logo_url: string | null;
  onboarding_stage: string;
  is_active: boolean;
  onboarded_at: string;
  subscriptions: { status: string; trial_ends_at: string | null }[];
  students: { count: number }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS = {
  forest: "#0C3B2E",
  sage: "#6D9773",
  tan: "#BB8A52",
  gold: "#FFBA00",
  red: "#ef4444",
  blue: "#3b82f6",
};

const formatNumber = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    "school.created": "New school onboarded",
    "school.suspended": "School suspended",
    "school.activated": "School activated",
    "subscription.extended": "Subscription extended",
    "subscription.cancelled": "Subscription cancelled",
    "staff.deactivated": "Staff account deactivated",
    "ticket.created": "Support ticket opened",
    "ticket.resolved": "Support ticket resolved",
  };
  return map[action] ?? action;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const KPICard = ({
  label,
  value,
  sub,
  accent,
  hero,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  hero?: boolean;
}) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-3"
    style={{
      backgroundColor: hero ? "#0C3B2E" : "rgba(15,45,36,0.6)",
      border: "1px solid rgba(109,151,115,0.15)",
    }}
  >
    <p
      className="text-xs font-semibold uppercase tracking-wider"
      style={{ color: "#6D9773", fontFamily: "Poppins, sans-serif" }}
    >
      {label}
    </p>
    <p
      className="text-3xl font-black"
      style={{
        color: hero ? "#FFBA00" : "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {value}
    </p>
    {sub && (
      <p
        className="text-xs"
        style={{ color: accent ?? "#6D9773", fontFamily: "Lora, serif" }}
      >
        {sub}
      </p>
    )}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-xs font-semibold uppercase tracking-wider mb-4"
    style={{ color: "#6D9773", fontFamily: "Poppins, sans-serif" }}
  >
    {children}
  </p>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const Dashboard = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated monthly enrollment data (will be real once more schools/months exist)
  const enrollmentData = [
    { month: "Jan", students: 0 },
    { month: "Feb", students: 0 },
    { month: "Mar", students: 0 },
    { month: "Apr", students: 0 },
    { month: "May", students: 0 },
    { month: "Jun", students: 0 },
    { month: "Jul", students: 1 },
  ];

  const subscriptionData = [
    { name: "Trial", value: kpi?.trialSchools ?? 0, color: COLORS.gold },
    { name: "Active", value: kpi?.activeSchools ?? 0, color: COLORS.sage },
    { name: "Expired", value: 0, color: COLORS.red },
  ];

  const onboardingData = [
    { stage: "Registered", count: 0 },
    { stage: "Profile", count: 0 },
    { stage: "Students", count: 0 },
    { stage: "First Term", count: 0 },
    { stage: "Live", count: kpi?.totalSchools ?? 0 },
  ];

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // KPI counts
        const [
          { count: totalSchools },
          { count: totalStudents },
          { count: totalStaff },
          { count: trialSchools },
          { count: activeSchools },
          { count: openTickets },
          { count: totalParents },
          { count: expiringSoon },
        ] = await Promise.all([
          supabase.from("schools").select("*", { count: "exact", head: true }),
          supabase.from("students").select("*", { count: "exact", head: true }),
          supabase.from("staff").select("*", { count: "exact", head: true }),
          supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "trial"),
          supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("support_tickets")
            .select("*", { count: "exact", head: true })
            .in("status", ["open", "in_progress"]),
          supabase.from("parents").select("*", { count: "exact", head: true }),
          supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .lte(
              "trial_ends_at",
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            )
            .gte("trial_ends_at", new Date().toISOString()),
        ]);

        setKpi({
          totalSchools: totalSchools ?? 0,
          totalStudents: totalStudents ?? 0,
          totalStaff: totalStaff ?? 0,
          trialSchools: trialSchools ?? 0,
          activeSchools: activeSchools ?? 0,
          openTickets: openTickets ?? 0,
          totalParents: totalParents ?? 0,
          expiringSoon: expiringSoon ?? 0,
        });

        // Recent activity
        const { data: activityData } = await supabase
          .from("audit_logs")
          .select("id, actor_name, action, entity_label, created_at")
          .order("created_at", { ascending: false })
          .limit(8);

        setRecentActivity(activityData ?? []);

        // Schools list
        const { data: schoolData } = await supabase
          .from("schools")
          .select(
            `
            id, name, logo_url, onboarding_stage, is_active, onboarded_at,
            subscriptions(status, trial_ends_at),
            students(count)
          `,
          )
          .order("onboarded_at", { ascending: false })
          .limit(5);

        setSchools((schoolData ?? []) as SchoolRow[]);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#FFBA00", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Platform Overview
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
          >
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => navigate("/schools")}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: "#FFBA00",
            color: "#0C3B2E",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          + Onboard School
        </button>
      </div>

      {/* KPI Cards — top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Schools"
          value={formatNumber(kpi?.totalSchools ?? 0)}
          sub="on platform"
          hero
        />
        <KPICard
          label="Total Students"
          value={formatNumber(kpi?.totalStudents ?? 0)}
          sub="across all schools"
        />
        <KPICard
          label="Staff Accounts"
          value={formatNumber(kpi?.totalStaff ?? 0)}
          sub="across all schools"
        />
        <KPICard
          label="Parent Accounts"
          value={formatNumber(kpi?.totalParents ?? 0)}
          sub="linked to students"
        />
      </div>

      {/* KPI Cards — second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Paid"
          value={kpi?.activeSchools ?? 0}
          sub="paying subscribers"
          accent="#FFBA00"
        />
        <KPICard
          label="On Trial"
          value={kpi?.trialSchools ?? 0}
          sub="trial period active"
          accent="#6D9773"
        />
        <KPICard
          label="Expiring Soon"
          value={kpi?.expiringSoon ?? 0}
          sub="within 7 days"
          accent={kpi?.expiringSoon ? "#ef4444" : "#6D9773"}
        />
        <KPICard
          label="Open Tickets"
          value={kpi?.openTickets ?? 0}
          sub="awaiting response"
          accent={kpi?.openTickets ? "#FFBA00" : "#6D9773"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student enrollment trend */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            backgroundColor: "rgba(15,45,36,0.6)",
            border: "1px solid rgba(109,151,115,0.15)",
          }}
        >
          <SectionTitle>Student Enrollment Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBA00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFBA00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(109,151,115,0.1)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6D9773", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6D9773", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0C3B2E",
                  border: "1px solid rgba(109,151,115,0.3)",
                  borderRadius: 12,
                  color: "white",
                }}
              />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#FFBA00"
                strokeWidth={2}
                fill="url(#studentGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription breakdown donut */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "rgba(15,45,36,0.6)",
            border: "1px solid rgba(109,151,115,0.15)",
          }}
        >
          <SectionTitle>Subscription Breakdown</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0C3B2E",
                  border: "1px solid rgba(109,151,115,0.3)",
                  borderRadius: 12,
                  color: "white",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span
                    style={{
                      color: "#6D9773",
                      fontSize: 11,
                      fontFamily: "Poppins",
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Onboarding pipeline bar */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "rgba(15,45,36,0.6)",
          border: "1px solid rgba(109,151,115,0.15)",
        }}
      >
        <SectionTitle>Onboarding Pipeline</SectionTitle>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={onboardingData} barSize={36}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(109,151,115,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="stage"
              tick={{ fill: "#6D9773", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6D9773", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0C3B2E",
                border: "1px solid rgba(109,151,115,0.3)",
                borderRadius: 12,
                color: "white",
              }}
            />
            <Bar dataKey="count" fill="#FFBA00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: schools list + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent schools */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "rgba(15,45,36,0.6)",
            border: "1px solid rgba(109,151,115,0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Recent Schools</SectionTitle>
            <button
              onClick={() => navigate("/schools")}
              className="text-xs font-semibold"
              style={{ color: "#FFBA00", fontFamily: "Poppins, sans-serif" }}
            >
              View all →
            </button>
          </div>

          {schools.length === 0 ? (
            <div className="text-center py-8">
              <p
                className="text-sm"
                style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
              >
                No schools onboarded yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schools.map((school) => {
                const sub = Array.isArray(school.subscriptions)
                  ? school.subscriptions[0]
                  : null;
                const studentCount = Array.isArray(school.students)
                  ? ((school.students[0] as any)?.count ?? 0)
                  : 0;
                return (
                  <div
                    key={school.id}
                    onClick={() => navigate(`/schools/${school.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-opacity-80"
                    style={{ backgroundColor: "rgba(12,59,46,0.4)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: "#FFBA00" }}
                    >
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: "#0C3B2E",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {school.name[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-white truncate"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {school.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
                      >
                        {studentCount} student{studentCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                      style={{
                        backgroundColor:
                          sub?.status === "active"
                            ? "rgba(109,151,115,0.2)"
                            : "rgba(255,186,0,0.15)",
                        color: sub?.status === "active" ? "#6D9773" : "#FFBA00",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {sub?.status ?? "trial"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "rgba(15,45,36,0.6)",
            border: "1px solid rgba(109,151,115,0.15)",
          }}
        >
          <SectionTitle>Recent Activity</SectionTitle>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p
                className="text-sm"
                style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
              >
                No activity yet — actions you take will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: "#FFBA00" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm text-white"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {actionLabel(item.action)}
                      {item.entity_label ? `: ${item.entity_label}` : ""}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
                    >
                      {item.actor_name} · {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
