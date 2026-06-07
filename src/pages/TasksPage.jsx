import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getTasks, createTask, updateTask, deleteTask } from "../api/taskApi";

const STATUSES = ["backlog", "todo", "in_progress", "review", "done"];
const STATUS_LABELS = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};
const STATUS_COLORS = {
  backlog: "#94a3b8",
  todo: "#3b6ef5",
  in_progress: "#f59e0b",
  review: "#8b5cf6",
  done: "#22c55e",
};
const PRIORITIES = ["low", "medium", "high", "urgent"];
const PRIORITY_COLORS = {
  low: "#22c55e",
  medium: "#3b6ef5",
  high: "#f59e0b",
  urgent: "#ef4444",
};

function TaskModal({ task, onClose, onSave, onDelete }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    due_date: task?.due_date ? task.due_date.slice(0, 10) : "",
    tags: task?.tags ? task.tags.join(",") : "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ width: 460 }}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Task" : "New Task"}</h3>
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
              placeholder="Task title"
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
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="mfield">
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mfield">
            <label>Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
            />
          </div>
          <div className="mfield">
            <label>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="e.g. frontend, urgent"
            />
          </div>
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button className="btn-danger" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() =>
              form.title.trim() &&
              onSave({
                ...form,
                tags: form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          >
            {isEdit ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("board"); // board | list
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      setTasks((await getTasks()) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (status = "todo") => {
    setSelected({ status });
    setModal(true);
  };
  const openEdit = (t) => {
    setSelected(t);
    setModal(true);
  };

  const handleSave = async (form) => {
    try {
      if (selected?.id) {
        const u = await updateTask(selected.id, form);
        setTasks((ts) => ts.map((t) => (t.id === selected.id ? u : t)));
      } else {
        const c = await createTask(form);
        setTasks((ts) => [...ts, c]);
      }
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((ts) => ts.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const byStatus = (s) => tasks.filter((t) => t.status === s);
  const total = tasks.length;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          {/* Header */}
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
                  <polyline points="9 11 12 14 22 5" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Tasks</h2>
                <p className="page-sub">{total} total tasks</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="view-tabs">
                <button
                  className={`view-tab${view === "board" ? " active" : ""}`}
                  onClick={() => setView("board")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>{" "}
                  Board
                </button>
                <button
                  className={`view-tab${view === "list" ? " active" : ""}`}
                  onClick={() => setView("list")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>{" "}
                  List
                </button>
              </div>
              <button className="btn-primary" onClick={() => openCreate()}>
                + New Task
              </button>
            </div>
          </div>

          {loading ? (
            <div className="full-loader">Loading…</div>
          ) : view === "board" ? (
            /* BOARD VIEW */
            <div className="kanban-board">
              {STATUSES.map((status) => {
                const col = byStatus(status);
                return (
                  <div key={status} className="kanban-col">
                    <div className="kanban-col-header">
                      <span
                        className="kanban-dot"
                        style={{ background: STATUS_COLORS[status] }}
                      />
                      <span className="kanban-label">
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="kanban-count">{col.length}</span>
                      <button
                        className="kanban-add"
                        onClick={() => openCreate(status)}
                      >
                        +
                      </button>
                    </div>
                    <div className="kanban-cards">
                      {col.map((task) => (
                        <div
                          key={task.id}
                          className="task-card"
                          onClick={() => openEdit(task)}
                        >
                          <p className="task-card-title">{task.title}</p>
                          {task.description && (
                            <p className="task-card-desc">{task.description}</p>
                          )}
                          <div className="task-card-meta">
                            {task.priority && (
                              <span
                                className="task-priority-chip"
                                style={{
                                  background:
                                    PRIORITY_COLORS[task.priority] + "22",
                                  color: PRIORITY_COLORS[task.priority],
                                }}
                              >
                                {task.priority}
                              </span>
                            )}
                            {task.due_date && (
                              <span className="task-due">
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="18"
                                    rx="2"
                                  />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {new Date(task.due_date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            )}
                          </div>
                          {task.tags?.length > 0 && (
                            <div className="task-tags">
                              {task.tags.map((tg, i) => (
                                <span key={i} className="task-tag">
                                  {tg}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="card" style={{ padding: 0 }}>
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          color: "#94a3b8",
                          padding: 32,
                        }}
                      >
                        No tasks yet
                      </td>
                    </tr>
                  ) : (
                    tasks.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => openEdit(t)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="tasks-table-title">{t.title}</td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              background: STATUS_COLORS[t.status] + "22",
                              color: STATUS_COLORS[t.status],
                            }}
                          >
                            {STATUS_LABELS[t.status] || t.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              background: PRIORITY_COLORS[t.priority] + "22",
                              color: PRIORITY_COLORS[t.priority],
                            }}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ color: "#64748b", fontSize: 12 }}>
                          {t.due_date
                            ? new Date(t.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td>
                          {t.tags?.map((tg, i) => (
                            <span key={i} className="task-tag">
                              {tg}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {modal && (
        <TaskModal
          task={selected}
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
