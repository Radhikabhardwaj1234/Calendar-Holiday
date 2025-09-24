import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("US");
  const [countries, setCountries] = useState([]);
  const [view, setView] = useState("month");
  const [darkMode, setDarkMode] = useState(false);
// Format date to YYYY-MM-DD in local time
  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
useEffect(() => {
  const fetchCountries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/countries");
      setCountries(res.data); // array of {id, country_name}
    } catch (err) {
      console.error("Failed to fetch countries", err);
    }
  };
  fetchCountries();
}, []);
  // Fetch holidays from backend
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      setError("");
      try {
        const year = date.getFullYear();
        const res = await axios.get(
          `http://localhost:5000/api/holidays/${country}/${year}`
        );
        setHolidays(res.data.holidays || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch holidays.");
      }
      setLoading(false);
    };
    fetchHolidays();
  }, [date, country]);
  //today 's date
  const formatToday = (d) => {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return d.toLocaleDateString("en-US", options);
};
  // Get holidays for a specific date
  const getHolidayNames = (d) => {
    const day = formatDate(d);
    return holidays.filter((h) => h.date === day).map((h) => h.name);
  };

  // Get week class based on holidays
  const getWeekClass = (weekDates) => {
    const holidayCount = weekDates.reduce((count, d) => {
      const day = formatDate(d);
      const isSunday = d.getDay() === 0;
      if (isSunday) return count;
      if (holidays.some((h) => h.date === day)) return count + 1;
      return count;
    }, 0);

    if (holidayCount === 1) return "light-green-week";
    if (holidayCount > 1) return "dark-green-week";
    return "";
  };

  // Render calendar based on view
  const renderCalendar = () => {
    if (view === "month") {
      return (
        <div className="calendar-wrapper monthly-calendar ">
        <Calendar width="100%"
          onChange={setDate}
          value={date}
          locale="en-US"
          activeStartDate={date}
          onActiveStartDateChange={({ activeStartDate }) => {
            setDate(new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1));
          }}
          tileContent={({ date: d }) => (
            <div className="holiday-names">
              {getHolidayNames(d).map((name, idx) => (
                <div key={idx} className="holiday-label">{name}</div>
              ))}
            </div>
          )}
          tileClassName={({ date: d }) => {
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const weekDates = Array.from({ length: 7 }, (_, i) => {
              const wd = new Date(weekStart);
              wd.setDate(weekStart.getDate() + i);
              return wd;
            });

            const todayStr = formatDate(new Date());
            return [
              getWeekClass(weekDates),
             formatDate(d) === todayStr ? "today" : "",
            ]
              .filter(Boolean)
              .join(" ");
          }}
        />
        </div>
      );
    } else if (view === "quarter") {
      const months = [];
      const startMonth = Math.floor(date.getMonth() / 3) * 3;
      for (let i = 0; i < 3; i++) {
        const monthDate = new Date(date.getFullYear(), startMonth + i, 1);
        months.push(
          <Calendar
            key={i}
            onChange={setDate}
            value={date}
            locale="en-US"
            activeStartDate={monthDate}
            onActiveStartDateChange={({ activeStartDate }) => {
              setDate(new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1));
            }}
            tileContent={({ date: d }) => (
              <div className="holiday-names">
                {getHolidayNames(d).map((name, idx) => (
                  <div key={idx} className="holiday-label">{name}</div>
                ))}
              </div>
            )}
            tileClassName={({ date: d }) => {
              const weekStart = new Date(d);
              weekStart.setDate(d.getDate() - d.getDay());
              const weekDates = Array.from({ length: 7 }, (_, i) => {
                const wd = new Date(weekStart);
                wd.setDate(weekStart.getDate() + i);
                return wd;
              });

              const todayStr = formatDate(new Date());
              return [
                getWeekClass(weekDates),
                formatDate(d) === todayStr ? "today" : "",
              ]
                .filter(Boolean)
                .join(" ");
            }}
          />
        );
      }
      return <div className="quarter-view">{months}</div>;
    }
  };

  return (
    <div className={`calendar-container ${darkMode ? "dark-mode" : ""}`}>
  
       <h2><div className="today-header">
        Today: {formatToday(new Date())}
        </div>
        </h2>
      <div className="controls">
        {/* Country selector */}
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {countries.map((c) => (
    <option key={c["iso-3166"]} value={c["iso-3166"]}>
      {c.country_name}
    </option>
  ))}
        </select>

        {/* Month selector */}
        <select
          value={date.getMonth()}
          onChange={(e) =>
            setDate(new Date(date.getFullYear(), parseInt(e.target.value), 1))
          }
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("en-US", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year selector */}
        <select
          value={date.getFullYear()}
          onChange={(e) =>
            setDate(new Date(parseInt(e.target.value), date.getMonth(), 1))
          }
        >
          {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <button onClick={() => setView(view === "month" ? "quarter" : "month")}>
          Switch to {view === "month" ? "Quarterly" : "Monthly"} View
        </button>
         <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* NEXT / PREVIOUS QUARTER BUTTONS */}
        {view === "quarter" && (
            <>
            <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 3, 1))}>
                Previous Quarter
            </button>
            <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 3, 1))}>
                Next Quarter
            </button>
            </>
        )}
      </div>

      {loading && <div className="loader"></div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && renderCalendar()}
    </div>
  );
};

export default CalendarView;
