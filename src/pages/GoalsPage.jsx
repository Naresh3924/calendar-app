import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../api/goalApi";

const FREQ_COLORS = { daily: "#3b6ef5", weekly: "#22c55e", monthly: "#f59e0b" };

function GoalModal({ goal, onClose, onSave, onDelete }) {
  const isEdit = !!goal?.id;
  const [form, setForm] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    target: goal?.target || 1,
    current_value: goal?.current_value || goal?.current || 0,
    frequency: goal?.frequency || "monthly",
    is_active: goal?.is_active !== false,
    start_date: goal?.start_date || new Date().toISOString().split("T")[0],
    end_date: goal?.end_date || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ width: 440 }}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Goal" : "New Goal"}</h3>
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
              placeholder="Goal title"
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
              <label>Target</label>
              <input
                type="number"
                min="1"
                value={form.target}
                onChange={(e) => set("target", Number(e.target.value))}
              />
            </div>
            <div className="mfield">
              <label>Current</label>
              <input
                type="number"
                min="0"
                value={form.current_value}
                onChange={(e) => set("current_value", Number(e.target.value))}
              />
            </div>
          </div>
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
          <div className="mrow">
            <div className="mfield">
              <label>Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="mfield">
              <label>End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            Active goal
          </label>
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button className="btn-danger" onClick={() => onDelete(goal.id)}>
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
            {isEdit ? "Save changes" : "Create goal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch_();
  }, []);

  const fetch_ = async () => {
    setLoading(true);
    try {
      setGoals((await getGoals()) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (selected?.id) {
        const u = await updateGoal(selected.id, form);
        setGoals((gs) => gs.map((g) => (g.id === selected.id ? u : g)));
      } else {
        const c = await createGoal(form);
        setGoals((gs) => [...gs, c]);
      }
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals((gs) => gs.filter((g) => g.id !== id));
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const handleIncrement = async (goal) => {
    const newVal = Math.min(
      (goal.current_value || goal.current || 0) + 1,
      goal.target,
    );
    try {
      const u = await updateGoal(goal.id, { ...goal, current_value: newVal });
      setGoals((gs) => gs.map((g) => (g.id === goal.id ? u : g)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (goal) => {
    try {
      const u = await updateGoal(goal.id, {
        ...goal,
        current_value: goal.target,
        is_active: false,
      });
      setGoals((gs) => gs.map((g) => (g.id === goal.id ? u : g)));
    } catch (e) {
      console.error(e);
    }
  };

  const active = goals.filter((g) => g.is_active !== false);
  const completed = goals.filter(
    (g) =>
      g.is_active === false || (g.current_value || g.current || 0) >= g.target,
  );
  const avgPct = active.length
    ? Math.round(
        active.reduce((acc, g) => {
          const cv = g.current_value || g.current || 0;
          return (
            acc +
            (g.target > 0
              ? Math.min(100, Math.round((cv / g.target) * 100))
              : 0)
          );
        }, 0) / active.length,
      )
    : 0;

  // streak placeholder
  const streak = goals.reduce((a, g) => a + (g.streak || 0), 0);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon" style={{ background: "#fff7ed" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Goals &amp; Habits</h2>
                <p className="page-sub">{active.length} active goals</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setSelected(null);
                setModal(true);
              }}
            >
              + New Goal
            </button>
          </div>

          {/* Stats bar */}
          <div className="goals-stats-row">
            <div className="goals-stat-card">
              <div
                className="goals-stat-icon"
                style={{ background: "#eff3ff" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b6ef5"
                  strokeWidth="2"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <div className="goals-stat-num">{avgPct}%</div>
                <div className="goals-stat-label">Avg Progress</div>
              </div>
            </div>
            <div className="goals-stat-card">
              <div
                className="goals-stat-icon"
                style={{ background: "#fff7ed" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div className="goals-stat-num">{streak}</div>
                <div className="goals-stat-label">Best Streak</div>
              </div>
            </div>
            <div className="goals-stat-card">
              <div
                className="goals-stat-icon"
                style={{ background: "#f0fdf4" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                >
                  <polyline points="9 11 12 14 22 5" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <div>
                <div className="goals-stat-num">{completed.length}</div>
                <div className="goals-stat-label">Completed</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="full-loader">Loading…</div>
          ) : (
            <div className="goals-grid">
              {goals.length === 0 && (
                <div
                  className="card"
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: 48,
                  }}
                >
                  <p style={{ color: "#94a3b8", fontSize: 14 }}>
                    No goals yet. Create your first goal!
                  </p>
                </div>
              )}
              {goals.map((goal) => {
                const cv = goal.current_value || goal.current || 0;
                const pct =
                  goal.target > 0
                    ? Math.min(100, Math.round((cv / goal.target) * 100))
                    : 0;
                const isDone = pct >= 100;
                const freq = goal.frequency || "monthly";
                return (
                  <div
                    key={goal.id}
                    className="goal-card"
                    onClick={() => {
                      setSelected(goal);
                      setModal(true);
                    }}
                  >
                    <div className="goal-card-header">
                      <div>
                        <span
                          className="goal-freq-chip"
                          style={{
                            background: FREQ_COLORS[freq] + "22",
                            color: FREQ_COLORS[freq],
                          }}
                        >
                          {freq}
                        </span>
                        <h4 className="goal-card-title">{goal.title}</h4>
                        {goal.description && (
                          <p className="goal-card-desc">{goal.description}</p>
                        )}
                      </div>
                      <div
                        className="goal-card-pct"
                        style={{ color: isDone ? "#22c55e" : "#3b6ef5" }}
                      >
                        {pct}%
                      </div>
                    </div>
                    <div className="goal-card-progress">
                      <div className="goal-bar-bg">
                        <div
                          className="goal-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: isDone ? "#22c55e" : "#3b6ef5",
                          }}
                        />
                      </div>
                      <span className="goal-card-fraction">
                        {cv} / {goal.target} {goal.unit || ""}
                      </span>
                    </div>
                    <div
                      className="goal-card-footer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="goal-inc-btn"
                        onClick={() => handleIncrement(goal)}
                      >
                        +1
                      </button>
                      {!isDone ? (
                        <span />
                      ) : (
                        <button
                          className="btn-primary"
                          style={{ fontSize: 12, padding: "5px 12px" }}
                          onClick={() => handleComplete(goal)}
                        >
                          Complete ✓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {modal && (
        <GoalModal
          goal={selected}
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
