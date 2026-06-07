import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../api/reminderApi";

function ReminderModal({ reminder, onClose, onSave, onDelete }) {
  const isEdit = !!reminder?.id;
  const [form, setForm] = useState({
    title: reminder?.title || "",
    remind_at: reminder?.remind_at ? reminder.remind_at.slice(0, 16) : "",
    is_recurring: reminder?.is_recurring || false,
    frequency: reminder?.frequency || "daily",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ width: 420 }}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Reminder" : "New Reminder"}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="mfield">
            <label>Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Reminder title"
            />
          </div>
          <div className="mfield">
            <label>Remind At</label>
            <input
              type="datetime-local"
              value={form.remind_at}
              onChange={(e) => set("remind_at", e.target.value)}
            />
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(e) => set("is_recurring", e.target.checked)}
            />
            Recurring reminder
          </label>
          {form.is_recurring && (
            <div className="mfield">
              <label>Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => set("frequency", e.target.value)}
              >
                {["daily", "weekly", "monthly"].map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button
              className="btn-danger"
              onClick={() => onDelete(reminder.id)}
            >
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => form.title.trim() && onSave(form)}
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch_();
  }, []);

  const fetch_ = async () => {
    setLoading(true);
    try {
      setReminders((await getReminders()) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (selected?.id) {
        const u = await updateReminder(selected.id, form);
        setReminders((rs) => rs.map((r) => (r.id === selected.id ? u : r)));
      } else {
        const c = await createReminder(form);
        setReminders((rs) => [...rs, c]);
      }
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      setReminders((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon" style={{ background: "#fef3c7" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Reminders</h2>
                <p className="page-sub">{reminders.length} active reminders</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setSelected(null);
                setModal(true);
              }}
            >
              + New Reminder
            </button>
          </div>

          {loading ? (
            <div className="full-loader">Loading…</div>
          ) : reminders.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 64 }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
                style={{ margin: "0 auto 16px" }}
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>
                No active reminders
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              {reminders.map((r, i) => (
                <div
                  key={r.id || i}
                  className="reminder-row"
                  onClick={() => {
                    setSelected(r);
                    setModal(true);
                  }}
                >
                  <div className="reminder-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="reminder-title">{r.title}</div>
                    {r.remind_at && (
                      <div className="reminder-time">
                        {new Date(r.remind_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date(r.remind_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {r.is_recurring && (
                          <span className="task-tag" style={{ marginLeft: 8 }}>
                            {r.frequency}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="icon-circle"
                    style={{ borderColor: "#fca5a5", color: "#ef4444" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {modal && (
        <ReminderModal
          reminder={selected}
          onClose={() => {
            setModal(false);
            setSelected(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
