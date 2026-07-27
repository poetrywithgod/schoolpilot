// apps/super-admin/src/pages/settings/Settings.tsx

import { useCallback, useEffect, useState } from "react";
import { Save, User, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import {
  getPlatformSettings,
  updatePlatformSettings,
  updateOwnProfile,
  updateOwnPassword,
} from "../../services/settings.service";
import type { PlatformSettings } from "../../types/settings.types";

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

export const Settings = () => {
  const admin = useAuthStore((s) => s.admin);
  const setAdmin = useAuthStore((s) => s.setAdmin);

  const [firstName, setFirstName] = useState(admin?.firstName ?? "");
  const [lastName, setLastName] = useState(admin?.lastName ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [platform, setPlatform] = useState<PlatformSettings | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState(true);
  const [supportEmail, setSupportEmail] = useState("");
  const [defaultTrialDays, setDefaultTrialDays] = useState("14");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [savingPlatform, setSavingPlatform] = useState(false);

  const loadPlatformSettings = useCallback(async () => {
    try {
      setLoadingPlatform(true);
      const data = await getPlatformSettings();
      setPlatform(data);
      setSupportEmail(data.support_email);
      setDefaultTrialDays(String(data.default_trial_days));
      setMaintenanceMode(data.maintenance_mode);
      setMaintenanceMessage(data.maintenance_message ?? "");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load platform settings"));
    } finally {
      setLoadingPlatform(false);
    }
  }, []);

  useEffect(() => {
    void loadPlatformSettings();
  }, [loadPlatformSettings]);

  const handleSaveProfile = async () => {
    if (!admin || !firstName.trim() || !lastName.trim()) return;
    try {
      setSavingProfile(true);
      await updateOwnProfile(admin.id, firstName.trim(), lastName.trim());
      setAdmin({ ...admin, firstName: firstName.trim(), lastName: lastName.trim() });
      toast.success("Profile updated.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      setSavingPassword(true);
      await updateOwnPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePlatform = async () => {
    if (!admin || !platform || !supportEmail.trim()) return;
    const trialDays = Number(defaultTrialDays);
    if (!Number.isFinite(trialDays) || trialDays <= 0) {
      toast.error("Default trial days must be a positive number.");
      return;
    }
    try {
      setSavingPlatform(true);
      await updatePlatformSettings(
        platform.id,
        {
          supportEmail: supportEmail.trim(),
          defaultTrialDays: trialDays,
          maintenanceMode,
          maintenanceMessage: maintenanceMessage.trim() || null,
        },
        admin.id,
        `${admin.firstName} ${admin.lastName}`.trim(),
        platform
      );
      toast.success("Platform settings saved.");
      await loadPlatformSettings();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to save platform settings"));
    } finally {
      setSavingPlatform(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6D9773", fontFamily: "Lora, serif" }}>
          Manage your account and platform-wide configuration
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User size={18} style={{ color: "#FFBA00" }} />
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            My Account
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={savingProfile}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={savingProfile}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Email</label>
            <input
              type="email"
              value={admin?.email ?? ""}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border opacity-50 cursor-not-allowed"
              style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)", color: "#6D9773" }}
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSaveProfile()}
            disabled={savingProfile || !firstName.trim() || !lastName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
          >
            <Save size={15} />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(109,151,115,0.1)" }}>
          <p className="text-xs font-medium mb-3" style={{ color: "#6D9773" }}>Change Password</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              disabled={savingPassword}
              className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
              style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={savingPassword}
              className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
              style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSavePassword()}
            disabled={savingPassword || !newPassword || !confirmPassword}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "rgba(109,151,115,0.15)", color: "#F5F5F0" }}
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "#0C3B2E", borderColor: "rgba(109,151,115,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe2 size={18} style={{ color: "#FFBA00" }} />
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
            Platform Settings
          </h2>
        </div>

        {loadingPlatform ? (
          <p className="text-sm" style={{ color: "#6D9773" }}>Loading...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                disabled={savingPlatform}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>
                Default Trial Period (days)
              </label>
              <input
                type="number"
                min={1}
                value={defaultTrialDays}
                onChange={(e) => setDefaultTrialDays(e.target.value)}
                disabled={savingPlatform}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border disabled:opacity-60"
                style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: "#F5F5F0" }}>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                disabled={savingPlatform}
                className="accent-current"
              />
              Maintenance mode
            </label>

            {maintenanceMode && (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#6D9773" }}>
                  Maintenance Message
                </label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="e.g. We're performing scheduled maintenance and will be back shortly."
                  rows={3}
                  disabled={savingPlatform}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border resize-none disabled:opacity-60"
                  style={{ backgroundColor: "#081f19", borderColor: "rgba(109,151,115,0.2)" }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleSavePlatform()}
              disabled={savingPlatform || !supportEmail.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#FFBA00", color: "#081f19" }}
            >
              <Save size={15} />
              {savingPlatform ? "Saving..." : "Save Platform Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
