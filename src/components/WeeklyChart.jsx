import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function WeeklyChart({ tasks = [], events = [] }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    const labels = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayMap = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 0: 5 };

    const taskCounts = [0, 0, 0, 0, 0, 0];
    const meetingCounts = [0, 0, 0, 0, 0, 0];

    tasks.forEach((t) => {
      if (!t.due_date) return;
      const dow = new Date(t.due_date).getDay();
      if (dayMap[dow] !== undefined) taskCounts[dayMap[dow]]++;
    });

    events.forEach((e) => {
      if (!e.start_time) return;
      const dow = new Date(e.start_time).getDay();
      if (dayMap[dow] !== undefined) meetingCounts[dayMap[dow]]++;
    });

    const focusPts = taskCounts.map((v) =>
      Math.round(v * 0.7 + Math.random() * 5),
    );

    if (instance.current) instance.current.destroy();
    instance.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Tasks",
            data: taskCounts.length ? taskCounts : [45, 62, 48, 70, 55, 68],
            borderColor: "#3b6ef5",
            backgroundColor: "rgba(59,110,245,0.09)",
            tension: 0.5,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Focus",
            data: focusPts.some((v) => v > 0)
              ? focusPts
              : [30, 45, 35, 52, 40, 50],
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6,182,212,0.06)",
            tension: 0.5,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Meetings",
            data: meetingCounts.some((v) => v > 0)
              ? meetingCounts
              : [15, 20, 12, 18, 10, 14],
            borderColor: "#8b5cf6",
            backgroundColor: "transparent",
            tension: 0.5,
            fill: false,
            pointRadius: 0,
            borderWidth: 1.5,
            borderDash: [4, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#94a3b8" },
          },
          y: { display: false },
        },
      },
    });
    return () => instance.current?.destroy();
  }, [tasks, events]);

  return (
    <div style={{ position: "relative", width: "100%", height: 170 }}>
      <canvas ref={ref} role="img" aria-label="Weekly productivity chart">
        Weekly chart
      </canvas>
    </div>
  );
}
