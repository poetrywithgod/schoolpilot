import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BarChart2,
  Wallet,
  Megaphone,
  Calendar,
  ChevronRight,
  X,
} from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";

const quickLinks = [
  {
    label: "My Subjects",
    icon: BookOpen,
    path: "/subjects",
    color: "#6D9773",
    bg: "#f0f7f0",
  },
  {
    label: "Results",
    icon: BarChart2,
    path: "/results",
    color: "#0C3B2E",
    bg: "#e8f5f0",
  },
  {
    label: "Fee Balance",
    icon: Wallet,
    path: "/fees",
    color: "#BB8A52",
    bg: "#fdf3e8",
  },
  {
    label: "Attendance",
    icon: Calendar,
    path: "/attendance",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    label: "Announcements",
    icon: Megaphone,
    path: "/announcements",
    color: "#b08800",
    bg: "#fffbeb",
  },
];

interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export const StudentDashboard = () => {
  const { student } = useAuthStore();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!student?.schoolId) return;

      // Load latest 3 announcements
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .eq("school_id", student.schoolId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) setAnnouncements(data);

      // Load school logo
      if (student.schoolLogoUrl) {
        setSchoolLogo(student.schoolLogoUrl);
      }
    };
    load();
  }, [student?.schoolId]);

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.includes(a.id),
  );

  return (
    <PageLayout title="Dashboard">
      <div className="px-5 py-4">
        {/* Welcome Card with School Logo */}
        <div
          className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ backgroundColor: "#0C3B2E" }}
        >
          {/* School logo watermark */}
          {schoolLogo && (
            <div
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full overflow-hidden"
              style={{ opacity: 0.08 }}
            >
              <img
                src="/FirstPilotLogo.svg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* School name badge */}
          <div className="flex items-center gap-2 mb-3">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="School logo"
                className="w-6 h-6 rounded-md object-contain bg-white p-0.5"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                style={{ backgroundColor: "#FFBA00", color: "#0C3B2E" }}
              >
                S
              </div>
            )}
            <span
              className="text-xs"
              style={{ color: "#6D9773", fontFamily: "Poppins, sans-serif" }}
            >
              {student?.schoolName}
            </span>
          </div>

          <p
            className="text-sm mb-1"
            style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
          >
            Welcome back,
          </p>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {student?.firstName} {student?.lastName}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "#BB8A52", fontFamily: "Poppins, sans-serif" }}
          >
            {student?.className ?? "No class assigned"}
          </p>
          <div className="mt-4">
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "#FFBA00",
                color: "#0C3B2E",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {student?.regNumber}
            </div>
          </div>
        </div>

        {/* Announcement Alerts */}
        {visibleAnnouncements.length > 0 && (
          <div className="mb-5 space-y-2">
            {visibleAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{
                  backgroundColor: "#0C3B2E10",
                  border: "1px solid #0C3B2E30",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "#FFBA00" }}
                >
                  <Megaphone size={14} style={{ color: "#0C3B2E" }} />
                </div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate("/announcements")}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{
                      color: "#0C3B2E",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {announcement.title}
                  </p>
                  <p
                    className="text-xs mt-0.5 line-clamp-1"
                    style={{ color: "#6b7280", fontFamily: "Lora, serif" }}
                  >
                    {announcement.body}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setDismissed((prev) => [...prev, announcement.id])
                  }
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={() => navigate("/announcements")}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold"
              style={{ color: "#0C3B2E", fontFamily: "Poppins, sans-serif" }}
            >
              View all announcements
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Quick Links */}
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "#9ca3af", fontFamily: "Poppins, sans-serif" }}
        >
          Quick Access
        </p>

        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm active:scale-95 transition-transform text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: item.bg }}
                >
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "#111827",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Profile completion banner */}
        {!student?.profileCompleted && (
          <div
            className="mt-4 rounded-2xl p-4 flex items-center gap-3"
            style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ backgroundColor: "#FFBA00", color: "#0C3B2E" }}
            >
              !
            </div>
            <div className="flex-1">
              <p
                className="text-xs font-semibold"
                style={{ color: "#92400e", fontFamily: "Poppins, sans-serif" }}
              >
                Complete your profile
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "#b45309", fontFamily: "Lora, serif" }}
              >
                Upload your photo and fill in your details
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
              style={{
                backgroundColor: "#FFBA00",
                color: "#0C3B2E",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Go →
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
