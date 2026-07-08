// apps/super-admin/src/pages/schools/Schools.tsx

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MapPin, Users } from "lucide-react";
import { getSchools } from "../../services/school.service";
import type { SchoolWithStats } from "../../types/school.types";

type FilterKey = "all" | "active" | "suspended" | "trial";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "trial", label: "Trial" },
];

export const Schools = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const data = await getSchools();
      setSchools(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = useMemo(() => {
    let result = schools;

    if (activeFilter === "active") {
      result = result.filter((s) => s.is_active && !s.is_suspended);
    } else if (activeFilter === "suspended") {
      result = result.filter((s) => s.is_suspended);
    } else if (activeFilter === "trial") {
      result = result.filter((s) => s.onboarding_stage === "trial");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q),
      );
    }

    return result;
  }, [schools, search, activeFilter]);

  const getStatusBadge = (school: SchoolWithStats) => {
    if (school.is_suspended) {
      return (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171" }}
        >
          Suspended
        </span>
      );
    }
    if (school.onboarding_stage === "trial") {
      return (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: "rgba(255,186,0,0.15)", color: "#FFBA00" }}
        >
          Trial
        </span>
      );
    }
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: "rgba(109,151,115,0.2)", color: "#6D9773" }}
      >
        Active
      </span>
    );
  };

  const formatLastActive = (value: string | null) => {
    if (!value) return "Never";
    const date = new Date(value);
    const days = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Schools
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "#6D9773", fontFamily: "Lora, serif" }}
          >
            {schools.length} school{schools.length === 1 ? "" : "s"} on the
            platform
          </p>
        </div>
        <button
          onClick={() => navigate("/schools/onboard")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
        >
          <Plus size={16} />
          Onboard School
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
            placeholder="Search by name, email, city, or slug..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none border"
            style={{
              backgroundColor: "#0C3B2E",
              borderColor: "rgba(109,151,115,0.2)",
            }}
          />
        </div>

        <div className="flex gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
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
            Loading schools...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : filteredSchools.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>
            No schools match your search.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(109,151,115,0.15)" }}>
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
                  Location
                </th>
                <th
                  className="text-left px-5 py-3.5 font-medium"
                  style={{ color: "#6D9773" }}
                >
                  Students
                </th>
                <th
                  className="text-left px-5 py-3.5 font-medium"
                  style={{ color: "#6D9773" }}
                >
                  Onboarding
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
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school) => (
                <tr
                  key={school.id}
                  onClick={() => navigate(`/schools/${school.id}`)}
                  className="cursor-pointer transition-colors hover:bg-white/5"
                  style={{ borderBottom: "1px solid rgba(109,151,115,0.08)" }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
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
                          {school.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {school.name}
                        </div>
                        <div className="text-xs" style={{ color: "#6D9773" }}>
                          {school.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#F5F5F0" }}>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} style={{ color: "#6D9773" }} />
                      {school.city || "—"}
                      {school.state ? `, ${school.state}` : ""}
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#F5F5F0" }}>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} style={{ color: "#6D9773" }} />
                      {school.student_count}
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#F5F5F0" }}>
                    {school.onboarding_stage || "—"}
                  </td>
                  <td className="px-5 py-3.5">{getStatusBadge(school)}</td>
                  <td className="px-5 py-3.5" style={{ color: "#6D9773" }}>
                    {formatLastActive(school.last_activity_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
