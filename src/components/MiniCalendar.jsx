import { useState } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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

export default function MiniCalendar({ events = [], onDayClick }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const eventDays = new Set(
    events
      .filter((e) => {
        const d = new Date(e.start_time);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.start_time).getDate()),
  );

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();

  const changeMonth = (dir) => {
    let m = month + dir,
      y = year;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setMonth(m);
    setYear(y);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: prevTotal - firstDay + 1 + i, other: true });
  for (let d = 1; d <= totalDays; d++) cells.push({ day: d, other: false });
  const rem = (firstDay + totalDays) % 7;
  if (rem > 0)
    for (let i = 1; i <= 7 - rem; i++) cells.push({ day: i, other: true });

  return (
    <>
      <div className="cal-top">
        <span className="cal-month-label">
          {MONTHS[month]} {year}
        </span>
        <div className="cal-arrows">
          <button className="cal-arrow" onClick={() => changeMonth(-1)}>
            &#8249;
          </button>
          <button className="cal-arrow" onClick={() => changeMonth(1)}>
            &#8250;
          </button>
        </div>
      </div>
      <div className="cal-grid">
        {DAYS.map((d) => (
          <div className="cal-dow" key={d}>
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const isToday =
            !c.other &&
            c.day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const hasEv = !c.other && eventDays.has(c.day);
          return (
            <div
              key={i}
              className={`cal-cell${c.other ? " other-month" : ""}${isToday ? " is-today" : ""}`}
              onClick={() =>
                !c.other &&
                onDayClick &&
                onDayClick(new Date(year, month, c.day))
              }
            >
              {c.day}
              {hasEv && <span className="cal-dot" />}
            </div>
          );
        })}
      </div>
    </>
  );
}
