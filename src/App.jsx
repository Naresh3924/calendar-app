import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routers/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import GoalsPage from "./pages/GoalsPage";
import MeetingsPage from "./pages/MeetingsPage";
import RemindersPage from "./pages/RemindersPage";
import NotesPage from "./pages/NotesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles/pages.css";

const P = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <P>
                <Dashboard />
              </P>
            }
          />
          <Route
            path="/calendar"
            element={
              <P>
                <CalendarPage />
              </P>
            }
          />
          <Route
            path="/tasks"
            element={
              <P>
                <TasksPage />
              </P>
            }
          />
          <Route
            path="/goals"
            element={
              <P>
                <GoalsPage />
              </P>
            }
          />
          <Route
            path="/meetings"
            element={
              <P>
                <MeetingsPage />
              </P>
            }
          />
          <Route
            path="/reminders"
            element={
              <P>
                <RemindersPage />
              </P>
            }
          />
          <Route
            path="/notes"
            element={
              <P>
                <NotesPage />
              </P>
            }
          />
          <Route
            path="/analytics"
            element={
              <P>
                <AnalyticsPage />
              </P>
            }
          />
          <Route
            path="/ai"
            element={
              <P>
                <AIAssistantPage />
              </P>
            }
          />
          <Route
            path="/settings"
            element={
              <P>
                <SettingsPage />
              </P>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
