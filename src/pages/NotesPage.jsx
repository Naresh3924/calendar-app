import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getNotes, createNote, updateNote, deleteNote } from "../api/noteApi";

function NoteModal({ note, onClose, onSave, onDelete }) {
  const isEdit = !!note?.id;
  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
    tags: note?.tags ? note.tags.join(",") : "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ width: 520 }}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Note" : "New Note"}</h3>
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
              placeholder="Note title"
            />
          </div>
          <div className="mfield">
            <label>Content</label>
            <textarea
              rows="6"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write your note…"
              style={{ resize: "vertical" }}
            />
          </div>
          <div className="mfield">
            <label>Tags</label>
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="tag1, tag2"
            />
          </div>
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button className="btn-danger" onClick={() => onDelete(note.id)}>
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
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch_();
  }, []);

  const fetch_ = async () => {
    setLoading(true);
    try {
      setNotes((await getNotes()) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (selected?.id) {
        const u = await updateNote(selected.id, form);
        setNotes((ns) => ns.map((n) => (n.id === selected.id ? u : n)));
      } else {
        const c = await createNote(form);
        setNotes((ns) => [...ns, c]);
      }
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes((ns) => ns.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
    setModal(false);
    setSelected(null);
  };

  const filtered = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon" style={{ background: "#f0fdf4" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <h2 className="page-title">Notes</h2>
                <p className="page-sub">{notes.length} notes</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="search-wrap" style={{ width: 200 }}>
                <span className="search-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  placeholder="Search notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ cursor: "text" }}
                />
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelected(null);
                  setModal(true);
                }}
              >
                + New Note
              </button>
            </div>
          </div>

          {loading ? (
            <div className="full-loader">Loading…</div>
          ) : filtered.length === 0 ? (
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
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>No notes yet</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filtered.map((note) => (
                <div
                  key={note.id}
                  className="note-card"
                  onClick={() => {
                    setSelected(note);
                    setModal(true);
                  }}
                >
                  <h4 className="note-title">{note.title}</h4>
                  {note.content && (
                    <p className="note-preview">
                      {note.content.slice(0, 120)}
                      {note.content.length > 120 ? "…" : ""}
                    </p>
                  )}
                  <div className="note-footer">
                    <div>
                      {note.tags?.map((t, i) => (
                        <span key={i} className="task-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="note-date">
                      {note.updated_at || note.created_at
                        ? new Date(
                            note.updated_at || note.created_at,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {modal && (
        <NoteModal
          note={selected}
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
