import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/eventApi";
import { getCalendars, createCalendar } from "../api/calendarApi";
import "../styles/calendar.css";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const COLORS = [
  "#3b6ef5",
  "#f59e0b",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
  "#14b8a6",
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseLocal(dateStr) {
  if (!dateStr) return new Date();
  return new Date(dateStr);
}

/* ── EVENT MODAL ── */
function EventModal({ event, onClose, onSave, onDelete, calendars }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    start_time: event?.start_time ? event.start_time.slice(0, 16) : "",
    end_time: event?.end_time ? event.end_time.slice(0, 16) : "",
    location: event?.location || "",
    color: event?.color || COLORS[0],
    is_all_day: event?.is_all_day || false,
    calendar_id: event?.calendar_id || calendars[0]?.id || "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Event" : "New Event"}</h3>
          <button className="modal-close" onClick={onClose}>
            &#10005;
          </button>
        </div>

        <div className="modal-body">
          <div className="mfield">
            <label>Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="mfield">
            <label>Description</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="mrow">
            <div className="mfield">
              <label>Start</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div className="mfield">
              <label>End</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
          </div>

          <div className="mfield">
            <label>Location</label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Conference Room A"
            />
          </div>

          <div className="mrow">
            <div className="mfield">
              <label>Color</label>
              <div className="color-row">
                {COLORS.map((c) => (
                  <div
                    key={c}
                    className={`color-dot${form.color === c ? " selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => set("color", c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={form.is_all_day}
              onChange={(e) => set("is_all_day", e.target.checked)}
            />
            All day event
          </label>
        </div>

        <div className="modal-footer">
          {isEdit && (
            <button className="btn-danger" onClick={() => onDelete(event.id)}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {isEdit ? "Save changes" : "Create event"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN CALENDAR PAGE ── */
export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState("month"); // month | week | day
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selected, setSelected] = useState(null); // event for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState(null); // date clicked to create
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [e, c] = await Promise.all([getEvents(), getCalendars()]);
      setEvents(e || []);
      setCalendars(c || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── navigation ── */
  const navigate = (dir) => {
    const d = new Date(current);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    if (view === "week") d.setDate(d.getDate() + dir * 7);
    if (view === "day") d.setDate(d.getDate() + dir);
    setCurrent(d);
  };

  /* ── label ── */
  const viewLabel = () => {
    if (view === "month")
      return `${MONTHS[current.getMonth()]} ${current.getFullYear()}`;
    if (view === "week") {
      const start = new Date(current);
      start.setDate(current.getDate() - current.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return current.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  /* ── event ops ── */
  const openCreate = (date) => {
    const dt = date || new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T09:00`;
    setSelected({
      start_time: local,
      end_time: local.replace("T09:00", "T10:00"),
    });
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setSelected(ev);
    setModalOpen(true);
  };

  const toISO = (dtLocal) => {
    if (!dtLocal) return null;
    return new Date(dtLocal).toISOString();
  };

  const cleanPayload = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );

  const handleSave = async (form) => {
    if (new Date(form.end_time) < new Date(form.start_time)) {
      alert("End time cannot be before start time");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user")); // or wherever stored

      const payload = cleanPayload({
        title: form.title,
        description: form.description,
        location: form.location,
        color: form.color,
        is_all_day: form.is_all_day,

        start_time: toISO(form.start_time),
        end_time: toISO(form.end_time),

        calendar_id: form.calendar_id || calendars[0]?.id,

        // 🔥 REQUIRED FIELD (fix)
        creator_user_id: user?.id || user?.user_id,
      });

      console.log("FINAL PAYLOAD:", payload);

      if (selected?.id) {
        const updated = await updateEvent(selected.id, payload);
        setEvents((evs) =>
          evs.map((e) => (e.id === selected.id ? updated : e)),
        );
      } else {
        const created = await createEvent(payload);
        setEvents((evs) => [...evs, created]);
      }
    } catch (e) {
      console.error("STATUS:", e.response?.status);
      console.error("ERROR DATA:", e.response?.data);
    }

    setModalOpen(false);
    setSelected(null);
  };
  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((evs) => evs.filter((e) => e.id !== id));
    } catch (e) {
      console.error(e);
    }
    setModalOpen(false);
    setSelected(null);
  };

  /* ── helpers ── */
  const eventsOnDay = (date) =>
    events.filter(
      (e) => e.start_time && isSameDay(parseLocal(e.start_time), date),
    );

  /* ── MONTH VIEW ── */
  const renderMonth = () => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotal = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++)
      cells.push({ day: prevTotal - firstDay + 1 + i, cur: false });
    for (let d = 1; d <= totalDays; d++) cells.push({ day: d, cur: true });
    const rem = (firstDay + totalDays) % 7;
    if (rem > 0)
      for (let i = 1; i <= 7 - rem; i++) cells.push({ day: i, cur: false });

    return (
      <div className="month-grid">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="month-dow">
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const date = c.cur ? new Date(year, month, c.day) : null;
          const dayEvs = date ? eventsOnDay(date) : [];
          const isToday = date && isSameDay(date, today);
          return (
            <div
              key={i}
              className={`month-cell${!c.cur ? " other" : ""}${isToday ? " is-today" : ""}`}
              onClick={() => c.cur && openCreate(date)}
            >
              <span className="month-day-num">{c.day}</span>
              <div className="month-events">
                {dayEvs.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="month-event-pill"
                    style={{ background: ev.color || COLORS[0] }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(ev);
                    }}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvs.length > 3 && (
                  <div className="month-more">+{dayEvs.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── WEEK VIEW ── */
  const renderWeek = () => {
    const start = new Date(current);
    start.setDate(current.getDate() - current.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="week-time-col" />
          {weekDays.map((d, i) => (
            <div
              key={i}
              className={`week-day-head${isSameDay(d, today) ? " is-today" : ""}`}
            >
              <span className="week-dow">{DAYS_SHORT[d.getDay()]}</span>
              <span
                className={`week-date-num${isSameDay(d, today) ? " today-circle" : ""}`}
              >
                {d.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="week-body">
          <div className="week-times">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="week-hour-label">
                {h === 0
                  ? ""
                  : h < 12
                    ? `${h} AM`
                    : h === 12
                      ? "12 PM"
                      : `${h - 12} PM`}
              </div>
            ))}
          </div>
          {weekDays.map((d, di) => {
            const dayEvs = eventsOnDay(d);
            return (
              <div key={di} className="week-col" onClick={() => openCreate(d)}>
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="week-slot" />
                ))}
                {dayEvs.map((ev) => {
                  const s = parseLocal(ev.start_time);
                  const topPct =
                    ((s.getHours() * 60 + s.getMinutes()) / (24 * 60)) * 100;
                  return (
                    <div
                      key={ev.id}
                      className="week-event"
                      style={{
                        top: `${topPct}%`,
                        background: ev.color || COLORS[0],
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(ev);
                      }}
                    >
                      <span>{ev.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── DAY VIEW ── */
  const renderDay = () => {
    const dayEvs = eventsOnDay(current);
    return (
      <div className="day-view">
        <div className="day-header">
          <span
            className={`day-big-num${isSameDay(current, today) ? " today-circle" : ""}`}
          >
            {current.getDate()}
          </span>
          <div>
            <div className="day-dow-full">{DAYS_FULL[current.getDay()]}</div>
            <div className="day-month">
              {MONTHS[current.getMonth()]} {current.getFullYear()}
            </div>
          </div>
        </div>
        <div className="day-body">
          <div className="week-times">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="week-hour-label">
                {h === 0
                  ? ""
                  : h < 12
                    ? `${h} AM`
                    : h === 12
                      ? "12 PM"
                      : `${h - 12} PM`}
              </div>
            ))}
          </div>
          <div className="day-col" onClick={() => openCreate(current)}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="week-slot" />
            ))}
            {dayEvs.map((ev) => {
              const s = parseLocal(ev.start_time);
              const topPct =
                ((s.getHours() * 60 + s.getMinutes()) / (24 * 60)) * 100;
              return (
                <div
                  key={ev.id}
                  className="week-event day-event"
                  style={{
                    top: `${topPct}%`,
                    background: ev.color || COLORS[0],
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(ev);
                  }}
                >
                  <strong>{ev.title}</strong>
                  {ev.location && <span> · {ev.location}</span>}
                </div>
              );
            })}
          </div>
        </div>
        {dayEvs.length === 0 && (
          <p className="day-empty">No events today. Click to add one.</p>
        )}
      </div>
    );
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content cal-page">
          {/* Calendar Toolbar */}
          <div className="cal-toolbar">
            <div className="cal-toolbar-left">
              <button
                className="cal-today-btn"
                onClick={() => setCurrent(new Date())}
              >
                Today
              </button>
              <div className="cal-nav-btns">
                <button onClick={() => navigate(-1)}>&#8249;</button>
                <button onClick={() => navigate(1)}>&#8250;</button>
              </div>
              <h2 className="cal-view-label">{viewLabel()}</h2>
            </div>
            <div className="cal-toolbar-right">
              <div className="view-tabs">
                {["month", "week", "day"].map((v) => (
                  <button
                    key={v}
                    className={`view-tab${view === v ? " active" : ""}`}
                    onClick={() => setView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <button
                className="btn-primary add-event-btn"
                onClick={() => openCreate()}
              >
                + New Event
              </button>
            </div>
          </div>

          {/* Calendar Body */}
          <div className="cal-body-card">
            {loading ? (
              <div className="cal-loading">Loading events…</div>
            ) : view === "month" ? (
              renderMonth()
            ) : view === "week" ? (
              renderWeek()
            ) : (
              renderDay()
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <EventModal
          event={selected}
          calendars={calendars}
          onClose={() => {
            setModalOpen(false);
            setSelected(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
