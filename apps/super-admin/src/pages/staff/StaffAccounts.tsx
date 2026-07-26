// apps/super-admin/src/pages/staff/StaffAccounts.tsx

import { useCallback, useEffect, useState } from "react";
import { Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Select } from "../../components/ui/Select";
import { useAuthStore } from "../../store/authStore";
import {
  getSuperAdmins,
  updateSuperAdminRole,
  setSuperAdminActive,
  createSuperAdmin,
} from "../../services/admin.service";
import type { SuperAdminAccount, SuperAdminRole } from "../../types/admin.types";

const ROLE_OPTIONS: { value: SuperAdminRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "support_agent", label: "Support Agent" },
];

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

export const StaffAccounts = () => {
  const currentAdmin = useAuthStore((s) => s.admin);
  const [admins, setAdmins] = useState<SuperAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SuperAdminRole>("support_agent");
  const [creating, setCreating] = useState(false);

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuperAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load team accounts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const handleRoleChange = async (id: string, newRole: string) => {
    if (!currentAdmin) return;
    const target = admins.find((a) => a.id === id);
    if (!target) return;
    try {
      setUpdatingId(id);
      await updateSuperAdminRole(
        id,
        newRole as SuperAdminRole,
        currentAdmin.id,
        `${currentAdmin.firstName} ${currentAdmin.lastName}`.trim(),
        `${target.first_name} ${target.last_name}`.trim(),
        target.role
      );
      await loadAdmins();
      toast.success("Role updated.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update role"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (admin: SuperAdminAccount) => {
    if (!currentAdmin) return;
    try {
      setUpdatingId(admin.id);
      await setSuperAdminActive(
        admin.id,
        !admin.is_active,
        currentAdmin.id,
        `${currentAdmin.firstName} ${currentAdmin.lastName}`.trim(),
        `${admin.first_name} ${admin.last_name}`.trim()
      );
      await loadAdmins();
      toast.success(admin.is_active ? "Account deactivated." : "Account reactivated.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update account status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("support_agent");
  };

  const handleCreate = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    try {
      setCreating(true);
      await createSuperAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
      });
      toast.success("Team member added.");
      resetForm();
      setShowAddModal(false);
      await loadAdmins();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to add team member"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            Staff Accounts
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6D9773", fontFamily: "Lora,serif" }}>
            {admins.length} team member{admins.length === 1 ? "" : "s"} with dashboard access
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
        >
          <Plus size={16} />
          Add Team Member
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        {loading ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>Loading team...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "#6D9773" }}>No team accounts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(109,151,115,0.15)" }}>
                <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Name</th>
                <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Email</th>
                <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Role</th>
                <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Last Login</th>
                <th className="text-left px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Status</th>
                <th className="text-right px-5 py-3.5 font-medium" style={{ color: "#6D9773" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: "1px solid rgba(109,151,115,0.08)" }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
                        style={{ backgroundColor: "rgba(255,186,0,0.15)", color: "#FFBA00" }}
                      >
                        {admin.first_name.charAt(0)}{admin.last_name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{admin.first_name} {admin.last_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#F5F5F0" }}>{admin.email}</td>
                  <td className="px-5 py-3.5 w-48">
                    <Select
                      value={admin.role}
                      onChange={(v) => void handleRoleChange(admin.id, v)}
                      disabled={updatingId === admin.id}
                      options={ROLE_OPTIONS}
                    />
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "#6D9773" }}>
                    {admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={
                        admin.is_active
                          ? { backgroundColor: "rgba(109,151,115,0.2)", color: "#6D9773" }
                          : { backgroundColor: "rgba(220,38,38,0.15)", color: "#f87171" }
                      }
                    >
                      {admin.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(admin)}
                      disabled={updatingId === admin.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={
                        admin.is_active
                          ? { backgroundColor: "rgba(220,38,38,0.1)", color: "#f87171" }
                          : { backgroundColor: "rgba(109,151,115,0.15)", color: "#6D9773" }
                      }
                    >
                      {admin.is_active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                      {admin.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.2)" }}
          >
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Add Team Member
            </h3>
            <p className="text-sm mb-4" style={{ color: "#6D9773" }}>
              A login will be created automatically with a default temporary password.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  disabled={creating}
                  className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                  style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  disabled={creating}
                  className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                  style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={creating}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />
              <Select
                value={role}
                onChange={(v) => setRole(v as SuperAdminRole)}
                disabled={creating}
                options={ROLE_OPTIONS}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); resetForm(); }}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "rgba(109,151,115,0.15)", color: "#F5F5F0" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={creating || !firstName.trim() || !lastName.trim() || !email.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
              >
                {creating ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
