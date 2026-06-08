import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WeeklyChart from "../components/WeeklyChart";
import MiniCalendar from "../components/MiniCalendar";
import { getTasks } from "../api/taskApi";
import { getEvents } from "../api/eventApi";
import { getGoals } from "../api/goalApi";
import { cacheBackendUserId, getBackendUserId } from "../api/userApi";
import "../styles/dashboard.css";

const STRIPE_COLORS = [
  "#3b6ef5",
  "#f59e0b",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

function fmtEventTime(s) {
  if (!s) return "";
  const d = new Date(s);
  const now = new Date();
  const tom = new Date();
  tom.setDate(now.getDate() + 1);
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (d.toDateString() === now.toDateString()) return `Today · ${time}`;
  if (d.toDateString() === tom.toDateString()) return `Tomorrow · ${time}`;
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${time}`;
}

// Scan any array of objects and find a UUID-formatted user id
function extractUUID(items) {
  const fields = [
    "created_by_user_id",
    "user_id",
    "organizer_user_id",
    "owner_id",
    "assigned_to",
    "created_by",
  ];
  for (const item of items || []) {
    for (const field of fields) {
      const val = item?.[field];
      if (
        val &&
        typeof val === "string" &&
        val.includes("-") &&
        val.length > 30
      ) {
        return val;
      }
    }
  }
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, e, g] = await Promise.all([
        getTasks(),
        getEvents(),
        getGoals(),
      ]);
      const taskList = t || [];
      const eventList = e || [];
      const goalList = g || [];

      setTasks(taskList);
      setEvents(eventList);
      setGoals(goalList);

      // Auto-extract and cache backend UUID from any returned data
      if (!getBackendUserId()) {
        const uuid =
          extractUUID(taskList) ||
          extractUUID(eventList) ||
          extractUUID(goalList);
        if (uuid) {
          cacheBackendUserId(uuid);
          console.log("✅ Backend UUID cached from data:", uuid);
        } else {
          // Log all fields of first task so we can see field names
          if (taskList.length > 0) {
            console.log("Task fields available:", JSON.stringify(taskList[0]));
          }
          if (eventList.length > 0) {
            console.log(
              "Event fields available:",
              JSON.stringify(eventList[0]),
            );
          }
        }
      }
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="full-loader">Loading…</div>;
  if (error) return <div className="full-loader error-state">{error}</div>;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const h = today.getHours();
  const greeting =
    h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  const todayEvts = events.filter((e) => e.start_time?.startsWith(todayStr));
  const pending = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "done",
  );
  const done = tasks.filter(
    (t) => t.status === "completed" || t.status === "done",
  );
  const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  const activeGoals = goals.filter((g) => g.is_active !== false);
  const meetingEvents = events.filter((e) =>
    ["meeting", "Meeting"].includes(e.event_type || e.type),
  );

  const statusMap = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    completed: done.length,
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          {/* Greeting */}
          <div className="greeting-row">
            <div className="greeting">
              <h1>{greeting} 👋</h1>
              <p className="greeting-date">
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="prod-badge">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Productivity Score: <strong>{pct}%</strong>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-row">
            <div className="stat-card featured">
              <div className="stat-top">
                <div className="stat-icon-box white-alpha">
                  <svg
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
                </div>
                <span className="stat-chip chip-white">↑ +12%</span>
              </div>
              <div className="stat-number">{todayEvts.length}</div>
              <div className="stat-desc">Today's Events</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon-box light-blue">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 11 12 14 22 5" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <span className="stat-chip chip-red">↓ -5%</span>
              </div>
              <div className="stat-number">{pending.length}</div>
              <div className="stat-desc">Pending Tasks</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon-box light-blue">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <span className="stat-chip chip-green">↑ +3</span>
              </div>
              <div className="stat-number">{activeGoals.length}</div>
              <div className="stat-desc">Active Goals</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon-box light-blue">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <span className="stat-chip chip-blue">+2</span>
              </div>
              <div className="stat-number">{meetingEvents.length}</div>
              <div className="stat-desc">Upcoming Meetings</div>
            </div>
          </div>

          {/* Chart + Calendar */}
          <div className="two-col">
            <div className="card">
              <div className="card-head">
                <h3>Weekly Productivity</h3>
                <div className="chart-legend">
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "#3b6ef5" }}
                    />
                    Tasks
                  </span>
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "#06b6d4" }}
                    />
                    Focus
                  </span>
                  <span>
                    <span
                      className="legend-dot"
                      style={{ background: "#8b5cf6" }}
                    />
                    Meetings
                  </span>
                </div>
              </div>
              <WeeklyChart tasks={tasks} events={events} />
            </div>
            <div className="card">
              <MiniCalendar events={events} />
            </div>
          </div>

          {/* Bottom 3-col */}
          <div className="three-col">
            {/* Upcoming Events */}
            <div className="card">
              <div className="card-head">
                <h3>Upcoming Events</h3>
              </div>
              {events.length === 0 ? (
                <p className="empty-msg">No upcoming events</p>
              ) : (
                events.slice(0, 5).map((ev, i) => (
                  <div className="event-row" key={ev.id || i}>
                    <div
                      className="event-stripe"
                      style={{
                        background:
                          ev.color || STRIPE_COLORS[i % STRIPE_COLORS.length],
                      }}
                    />
                    <div>
                      <div className="event-name">{ev.title}</div>
                      <div className="event-time">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {fmtEventTime(ev.start_time)}
                        {ev.location && <span> · {ev.location}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tasks */}
            <div className="card">
              <div className="card-head">
                <h3>Tasks</h3>
                <span className="tasks-done-badge">
                  {done.length}/{tasks.length} done
                </span>
              </div>
              <div className="completion-row">
                <span className="completion-pct">{pct}%</span>
                <span className="completion-label">completion</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="task-status-grid">
                {[
                  { key: "todo", label: "To Do", color: "#94a3b8" },
                  {
                    key: "in_progress",
                    label: "In Progress",
                    color: "#3b6ef5",
                  },
                  { key: "review", label: "Review", color: "#f59e0b" },
                  { key: "completed", label: "Done", color: "#22c55e" },
                ].map(({ key, label, color }) => (
                  <div className="task-status-item" key={key}>
                    <span
                      className="status-circle"
                      style={{ borderColor: color }}
                    />
                    <div>
                      <span className="status-text-label">{label}</span>
                      <span className="status-text-count">
                        {statusMap[key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="card">
              <div className="card-head">
                <h3>Goals</h3>
              </div>
              {goals.length === 0 ? (
                <p className="empty-msg">No goals yet</p>
              ) : (
                goals.slice(0, 4).map((goal, i) => {
                  const cv = goal.current_value ?? goal.current ?? 0;
                  const p =
                    goal.target > 0
                      ? Math.min(100, Math.round((cv / goal.target) * 100))
                      : 0;
                  const clr = ["#3b6ef5", "#22c55e", "#f59e0b", "#3b6ef5"][
                    i % 4
                  ];
                  return (
                    <div className="goal-entry" key={goal.id || i}>
                      <div className="goal-row">
                        <span className="goal-title">{goal.title}</span>
                        <span className="goal-pct-text" style={{ color: clr }}>
                          {p}%
                        </span>
                      </div>
                      <div className="goal-bar-bg">
                        <div
                          className="goal-bar-fill"
                          style={{ width: `${p}%`, background: clr }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
