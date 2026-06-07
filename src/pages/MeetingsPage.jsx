import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../api/meetingApi";

function MeetingModal({ meeting, onClose, onSave, onDelete }) {
  const isEdit = !!meeting?.id;
  const [form, setForm] = useState({
    title: meeting?.title || "",
    description: meeting?.description || "",
    start_time: meeting?.start_time ? meeting.start_time.slice(0, 16) : "",
    duration_minutes: meeting?.duration_minutes || 30,
    location: meeting?.location || "",
    meeting_url: meeting?.meeting_url || "",
    status: meeting?.status || "scheduled",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ width: 460 }}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Meeting" : "New Meeting"}</h3>
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
              placeholder="Meeting title"
            />
          </div>
          <div className="mfield">
            <label>Description</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="mrow">
            <div className="mfield">
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div className="mfield">
              <label>Duration (min)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={form.duration_minutes}
                onChange={(e) =>
                  set("duration_minutes", Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="mfield">
            <label>Location</label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Conference Room"
            />
          </div>
          <div className="mfield">
            <label>Meeting URL</label>
            <input
              value={form.meeting_url}
              onChange={(e) => set("meeting_url", e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div className="mfield">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {["scheduled", "in_progress", "completed", "cancelled"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button className="btn-danger" onClick={() => onDelete(meeting.id)}>
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
            {isEdit ? "Save changes" : "Create meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch_();
  }, []);

  const fetch_ = async () => {
    setLoading(true);
    try {
      setMeetings((await getMeetings()) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (selected?.id) {
        const u = await updateMeeting(selected.id, form);
        setMeetings((ms) => ms.map((m) => (m.id === selected.id ? u : m)));
      } else {
        const c = await createMeeting(form);
        setMeetings((ms) => [...ms, c]);
      }
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMeeting(id);
      setMeetings((ms) => ms.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const now = new Date();
  const upcoming = meetings.filter(
    (m) => m.start_time && new Date(m.start_time) >= now,
  );
  const past = meetings.filter(
    (m) => m.start_time && new Date(m.start_time) < now,
  );

  const fmtTime = (s) => {
    if (!s) return "";
    const d = new Date(s);
    return (
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    );
  };

  const MeetingCard = ({ m }) => (
    <div className="meeting-card">
      <div className="meeting-card-icon">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b6ef5"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <div className="meeting-card-body">
        <div className="meeting-card-title">{m.title}</div>
        <div className="meeting-card-meta">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {fmtTime(m.start_time)}
          {m.duration_minutes && (
            <>
              {" "}
              &nbsp;
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {m.duration_minutes}min
            </>
          )}
        </div>
        {m.location && <div className="meeting-card-meta">{m.location}</div>}
        <span
          className="status-pill"
          style={{
            background: "#eff3ff",
            color: "#3b6ef5",
            marginTop: 6,
            display: "inline-block",
          }}
        >
          {m.status || "scheduled"}
        </span>
      </div>
      <div className="meeting-card-actions">
        {m.meeting_url && (
          <a
            href={m.meeting_url}
            target="_blank"
            rel="noreferrer"
            className="icon-circle"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
        <button
          className="icon-circle"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(m);
            setModal(true);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="icon-circle"
          style={{ borderColor: "#fca5a5", color: "#ef4444" }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(m.id);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
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
              <div className="page-icon" style={{ background: "#f0f4ff" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b6ef5"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Meetings</h2>
                <p className="page-sub">{upcoming.length} upcoming</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setSelected(null);
                setModal(true);
              }}
            >
              + New Meeting
            </button>
          </div>

          {loading ? (
            <div className="full-loader">Loading…</div>
          ) : (
            <>
              <div className="card">
                <h3 className="section-title">Upcoming</h3>
                {upcoming.length === 0 ? (
                  <p className="empty-msg">No upcoming meetings</p>
                ) : (
                  <div className="meetings-list">
                    {upcoming.map((m) => (
                      <MeetingCard key={m.id} m={m} />
                    ))}
                  </div>
                )}
              </div>
              {past.length > 0 && (
                <div className="card">
                  <h3 className="section-title">Past Meetings</h3>
                  <div className="meetings-list">
                    {past.map((m) => (
                      <MeetingCard key={m.id} m={m} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {modal && (
        <MeetingModal
          meeting={selected}
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
