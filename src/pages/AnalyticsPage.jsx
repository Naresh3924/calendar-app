import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getTasks } from "../api/taskApi";
import { getEvents } from "../api/eventApi";
import { getGoals } from "../api/goalApi";
import { getMeetings } from "../api/meetingApi";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function DonutChart({ data, colors, labels }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          { data, backgroundColor: colors, borderWidth: 0, cutout: "68%" },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "bottom" },
          tooltip: { enabled: true },
        },
      },
    });
    return () => inst.current?.destroy();
  }, [data]);
  return <canvas ref={ref} />;
}

function BarChart({ labels, data }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{ data, backgroundColor: "#3b6ef5", borderRadius: 4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#94a3b8" },
          },
          y: {
            grid: { color: "#f1f4f8" },
            ticks: { font: { size: 11 }, color: "#94a3b8" },
          },
        },
      },
    });
    return () => inst.current?.destroy();
  }, [data]);
  return (
    <div style={{ height: 160, position: "relative" }}>
      <canvas ref={ref} />
    </div>
  );
}

function GaugeChart({ pct }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [pct, 100 - pct],
            backgroundColor: ["#3b6ef5", "#f1f4f8"],
            borderWidth: 0,
            cutout: "75%",
            circumference: 180,
            rotation: 270,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    });
    return () => inst.current?.destroy();
  }, [pct]);
  return (
    <div style={{ position: "relative", width: 160, margin: "0 auto" }}>
      <canvas ref={ref} />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>
          {pct}%
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>
          Overall productivity
        </div>
      </div>
    </div>
  );
}

function LineChart({ labels, datasets }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#94a3b8" },
          },
          y: { display: false },
        },
      },
    });
    return () => inst.current?.destroy();
  }, []);
  return (
    <div style={{ height: 160 }}>
      <canvas ref={ref} />
    </div>
  );
}

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTasks(), getEvents(), getGoals(), getMeetings()])
      .then(([t, e, g, m]) => {
        setTasks(t || []);
        setEvents(e || []);
        setGoals(g || []);
        setMeetings(m || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const done = tasks.filter(
    (t) => t.status === "completed" || t.status === "done",
  );
  const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  const goalsDone = goals.filter(
    (g) => (g.current_value || 0) >= g.target,
  ).length;

  // Weekly activity (tasks by day)
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = Array(7).fill(0);
  tasks.forEach((t) => {
    if (!t.due_date) return;
    const d = new Date(t.due_date).getDay();
    dayCounts[d === 0 ? 6 : d - 1]++;
  });

  // Task distribution donut
  const statusCounts = [
    tasks.filter((t) => t.status === "backlog").length,
    tasks.filter((t) => t.status === "todo").length,
    tasks.filter((t) => t.status === "in_progress").length,
    tasks.filter((t) => t.status === "review").length,
    done.length,
  ];

  // Events by category
  const catMap = {};
  events.forEach((e) => {
    const c = e.category || e.event_type || "other";
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const catLabels = Object.keys(catMap);
  const catData = catLabels.map((k) => catMap[k]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon" style={{ background: "#eff3ff" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b6ef5"
                  strokeWidth="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Analytics</h2>
                <p className="page-sub">Your productivity insights</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="full-loader">Loading…</div>
          ) : (
            <>
              {/* Top stat cards */}
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
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <span className="stat-chip chip-green">↑ +4%</span>
                  </div>
                  <div className="stat-number">{pct}%</div>
                  <div className="stat-desc">Completion Rate</div>
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
                  </div>
                  <div className="stat-number">{tasks.length}</div>
                  <div className="stat-desc">Total Tasks</div>
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
                  </div>
                  <div className="stat-number">{meetings.length}</div>
                  <div className="stat-desc">Meetings</div>
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
                  </div>
                  <div className="stat-number">{goalsDone}</div>
                  <div className="stat-desc">Goals Done</div>
                </div>
              </div>

              <div className="two-col">
                <div className="card">
                  <div className="card-head">
                    <h3>Productivity Score</h3>
                  </div>
                  <GaugeChart pct={pct} />
                </div>
                <div className="card">
                  <div className="card-head">
                    <h3>Weekly Activity</h3>
                  </div>
                  <BarChart labels={DAYS} data={dayCounts} />
                </div>
              </div>

              <div className="two-col">
                <div className="card">
                  <div className="card-head">
                    <h3>Task Distribution</h3>
                  </div>
                  <div style={{ maxWidth: 240, margin: "0 auto" }}>
                    <DonutChart
                      data={statusCounts}
                      colors={[
                        "#94a3b8",
                        "#3b6ef5",
                        "#f59e0b",
                        "#8b5cf6",
                        "#22c55e",
                      ]}
                      labels={[
                        "Backlog",
                        "To Do",
                        "In Progress",
                        "Review",
                        "Done",
                      ]}
                    />
                  </div>
                </div>
                <div className="card">
                  <div className="card-head">
                    <h3>Events by Category</h3>
                  </div>
                  {catLabels.length > 0 ? (
                    <LineChart
                      labels={
                        catLabels.length
                          ? catLabels
                          : ["work", "personal", "health", "other"]
                      }
                      datasets={[
                        {
                          data: catData.length ? catData : [0, 0, 0, 0],
                          borderColor: "#3b6ef5",
                          backgroundColor: "rgba(59,110,245,0.08)",
                          tension: 0.5,
                          fill: true,
                          pointRadius: 3,
                          borderWidth: 2,
                        },
                      ]}
                    />
                  ) : (
                    <p className="empty-msg">No event data</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
