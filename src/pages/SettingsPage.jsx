import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { updateMe } from "../api/userApi";

const TABS = ["Profile", "Appearance", "Notifications", "General"];

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Profile");
  const [profile, setProfile] = useState({
    display_name: user?.displayName || "",
    email: user?.email || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactMode: false,
    animations: true,
  });
  const [notifs, setNotifs] = useState({
    eventReminders: true,
    taskDueDates: true,
    meetingInvites: true,
    goalUpdates: false,
    systemUpdates: true,
  });
  const [general, setGeneral] = useState({
    defaultView: "Month",
    weekStartsOn: "Sunday",
    timeFormat: "12 Hour",
  });
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async () => {
    try {
      await updateMe(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        cursor: "pointer",
        transition: "background 0.2s",
        background: checked ? "#3b6ef5" : "#d1d5db",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          transition: "left 0.2s",
        }}
      />
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon" style={{ background: "#f4f6f9" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Settings</h2>
                <p className="page-sub">Manage your preferences</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ maxWidth: 640 }}>
            {/* Tabs */}
            <div className="settings-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`settings-tab${tab === t ? " active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              {tab === "Profile" && (
                <div>
                  <h3 className="settings-section-title">Profile Settings</h3>
                  <div className="mfield">
                    <label>Full Name</label>
                    <input
                      value={profile.display_name}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          display_name: e.target.value,
                        }))
                      }
                      placeholder="Your name"
                    />
                  </div>
                  <div className="mfield">
                    <label>Email</label>
                    <input
                      value={profile.email}
                      readOnly
                      style={{ background: "#f8fafc", color: "#94a3b8" }}
                    />
                  </div>
                  <div className="mfield">
                    <label>Timezone</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, timezone: e.target.value }))
                      }
                    >
                      {[
                        "UTC",
                        "Asia/Kolkata",
                        "America/New_York",
                        "America/Los_Angeles",
                        "Europe/London",
                        "Asia/Tokyo",
                      ].map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleSaveProfile}
                    style={{ marginTop: 8 }}
                  >
                    {saved ? "Saved ✓" : "Save Changes"}
                  </button>
                </div>
              )}

              {tab === "Appearance" && (
                <div>
                  <h3 className="settings-section-title">Appearance</h3>
                  {[
                    {
                      key: "darkMode",
                      label: "Dark Mode",
                      desc: "Toggle between light and dark theme",
                    },
                    {
                      key: "compactMode",
                      label: "Compact Mode",
                      desc: "Reduce padding and spacing",
                    },
                    {
                      key: "animations",
                      label: "Animations",
                      desc: "Enable smooth transitions",
                    },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="settings-row">
                      <div>
                        <div className="settings-row-label">{label}</div>
                        <div className="settings-row-desc">{desc}</div>
                      </div>
                      <Toggle
                        checked={appearance[key]}
                        onChange={(v) =>
                          setAppearance((a) => ({ ...a, [key]: v }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {tab === "Notifications" && (
                <div>
                  <h3 className="settings-section-title">
                    Notification Preferences
                  </h3>
                  {[
                    {
                      key: "eventReminders",
                      label: "Event Reminders",
                      desc: "Get notified before events",
                    },
                    {
                      key: "taskDueDates",
                      label: "Task Due Dates",
                      desc: "Alert when tasks are due",
                    },
                    {
                      key: "meetingInvites",
                      label: "Meeting Invites",
                      desc: "Notify for new meeting invites",
                    },
                    {
                      key: "goalUpdates",
                      label: "Goal Updates",
                      desc: "Track goal progress alerts",
                    },
                    {
                      key: "systemUpdates",
                      label: "System Updates",
                      desc: "Platform news and updates",
                    },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="settings-row">
                      <div>
                        <div className="settings-row-label">{label}</div>
                        <div className="settings-row-desc">{desc}</div>
                      </div>
                      <Toggle
                        checked={notifs[key]}
                        onChange={(v) => setNotifs((n) => ({ ...n, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {tab === "General" && (
                <div>
                  <h3 className="settings-section-title">General Settings</h3>
                  <div className="mfield">
                    <label>Default Calendar View</label>
                    <select
                      value={general.defaultView}
                      onChange={(e) =>
                        setGeneral((g) => ({
                          ...g,
                          defaultView: e.target.value,
                        }))
                      }
                    >
                      {["Month", "Week", "Day"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mfield">
                    <label>Week Starts On</label>
                    <select
                      value={general.weekStartsOn}
                      onChange={(e) =>
                        setGeneral((g) => ({
                          ...g,
                          weekStartsOn: e.target.value,
                        }))
                      }
                    >
                      {["Sunday", "Monday"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mfield">
                    <label>Time Format</label>
                    <select
                      value={general.timeFormat}
                      onChange={(e) =>
                        setGeneral((g) => ({
                          ...g,
                          timeFormat: e.target.value,
                        }))
                      }
                    >
                      {["12 Hour", "24 Hour"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
