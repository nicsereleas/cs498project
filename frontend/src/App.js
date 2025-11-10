import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./Calendar.css";
import "./Form.css";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleClick = (day) => setSelectedDate(day);

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      <div
        key={day}
        className={`day ${selectedDate === day ? "selected" : ""}`}
        onClick={() => handleClick(day)}
      >
        {day}
      </div>
    );
  }

  return (
    <>
      <div className="top-container">
        <h2 className="chores">Here are the chores</h2>
        <h2 className="bills">Here are the bills</h2>
        <h3 className="top-link"><Link to="/form">
            <button className="nav-button">Add a Bill or Chore</button>
          </Link>
          </h3>
      </div>
      <div className="bottom-container">
        <div className="calendar-container">
          <h2>
            {today.toLocaleString("default", { month: "long" })} {year}
          </h2>
          <div className="weekdays">
            {daysOfWeek.map((d) => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>
          <div className="calendar-grid">{calendarDays}</div>
        </div>

        <div className="right-container">
          <h4>Here is what you have coming up in the next 7 days:</h4>
        </div>
      </div>
    </>
  );
}


function FormPage() {
  return (
    <body style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
    <div className="form-container">
      <h1>Sample Form</h1>
      <form>
        <label>
          Chore or Bill:
          <select defaultValue="" style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}>
            <option value="" disabled>
            </option>
            <option value="chore">Chore</option>
            <option value="bill">Bill</option>
          </select>
        </label>
        <label>
          Name:
          <input type="email" placeholder="Name of Bill/Chore" style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
        </label>

        <label>
          Notes:
          <textarea placeholder="Anything you want to add" style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}></textarea>
        </label>
        <Link to="/form">
        <button type="submit">Submit</button>
        </Link>
      </form>
      <Link to="/">
        <button className="nav-button">Back to Calendar</button>
      </Link>
    </div>
    </body>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/form" element={<FormPage />} />
    </Routes>
  );
}

export default App;
