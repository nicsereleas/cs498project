import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

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
    <div className="calendar-container">
      <h1>
        {today.toLocaleString("default", { month: "long" })} {year}
      </h1>
      <div className="weekdays">
        {daysOfWeek.map((d) => (
          <div key={d} className="weekday">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">{calendarDays}</div>
      <Link to="/form">
        <button className="nav-button">Go to Form</button>
      </Link>
    </div>
  );
}

function FormPage() {
  return (
    <div className="form-container">
      <h1>Sample Form</h1>
      <form>
        <label>
          Name:
          <input type="text" placeholder="Enter your name" />
        </label>
        <label>
          Email:
          <input type="email" placeholder="Enter your email" />
        </label>
        <label>
          Feedback:
          <textarea placeholder="Your feedback here"></textarea>
        </label>
        <button type="submit">Submit</button>
      </form>
      <Link to="/">
        <button className="nav-button">Back to Calendar</button>
      </Link>
    </div>
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
