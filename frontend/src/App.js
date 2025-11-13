import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./Calendar.css";
import "./Form.css";

const API_BASE = "http://localhost:5000/api"; 
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [chores, setChores] = useState([]);
  const [bills, setBills] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleClick = (day) => setSelectedDate(day);

  // Fetch data for dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [choresRes, billsRes, upcomingRes] = await Promise.all([
          fetch(`${API_BASE}/chores`),
          fetch(`${API_BASE}/bills`),
          fetch(`${API_BASE}/dashboard/upcoming`)
        ]);

        
      const choresData = await choresRes.json();
      const billsData = await billsRes.json();
      const upcomingData = await upcomingRes.json();

      setChores(Array.isArray(choresData) ? choresData : []);
      setBills(Array.isArray(billsData) ? billsData : []);
      setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  // Render days
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
        <h2 className="chores">Chores Left: {chores.length}</h2>
        <h2 className="bills">Bills Left: {bills.length}</h2>
        <h3 className="top-link">
          <Link to="/form">
            <button className="nav-button">Add a Bill, Chore, or Roommate</button>
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
          <h4>Here’s what you have coming up in the next 7 days:</h4>
          <ul>
            {upcoming.map((item, i) => (
              <li key={i}>{item.description || item.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}


function FormPage() {
  const [formType, setFormType] = useState("");
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let data = {};

    if (formType === "bill") {
      data = {
        description: formData.description,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
      };
    } else if (formType === "roommate") {
      data = {
        name: formData.name,
        email: formData.email,
      };
    } else if (formType === "chore") {
      data = {
        name: formData.name,
        assignedTo: formData.assignedTo?.split(",").map(s => s.trim()) || [],
        dueDate: formData.dueDate,
      };
    }

    const response = await fetch(`${API_BASE}/${formType}s`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Server error:", result);
      throw new Error(result.message || "Failed to submit");
    }

    alert(`${formType} added successfully!`);
    setFormType("");
    setFormData({});
  } catch (error) {
    console.error(error);
    alert("Error submitting form: " + error.message);
  }
};


  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="form-container">
        <h1>Add Data</h1>

        <form onSubmit={handleSubmit}>
          <label>
            What do you want to add?
            <select
              name="type"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
            >
              <option value="">Select Type</option>
              <option value="roommate">Roommate</option>
              <option value="bill">Bill</option>
              <option value="chore">Chore</option>
            </select>
          </label>

          {formType === "roommate" && (
            <>
              <label>
                Name:
                <input name="name" value={formData.name || ""} onChange={handleChange} required />
              </label>
              <label>
                Email:
                <input
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}

          {formType === "bill" && (
            <>
              <label>
                Description:
                <input
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Amount:
                <input
                  name="amount"
                  type="number"
                  value={formData.amount || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Due Date:
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}

          {formType === "chore" && (
            <>
              <label>
                Name:
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Assigned To (comma-separated IDs):
                <input
                  name="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={handleChange}
                />
              </label>
              <label>
                Due Date:
                <input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={handleChange}
                  required
                />
              </label>
            </>
          )}

          <button type="submit" className="nav-button">Submit</button>
        </form>

        <Link to="/">
          <button className="nav-button">Back to Calendar</button>
        </Link>
      </div>
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
