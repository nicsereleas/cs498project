import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./Calendar.css";
import "./Form.css";
import FunctionTracker from "./FunctionTracker";
import "./FunctionTracker.css";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState(null);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleClick = (day) => {
    setSelectedDate(day);
    setModalDay(day);
    setIsModalOpen(true);
  };
  
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="day empty" />);
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
        <h2 className="chores">Chores Left:</h2>
        <h2 className="bills">Bills Left:</h2>
        <h3 className="top-link">
          <Link to="/form">
            <button className="nav-button">Add a Bill or Chore</button>
          </Link>
          <Link to="/tracker">
            <button className="nav-button">Function Tracker</button>
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
              <div key={d} className="weekday">
                {d}
              </div>
            ))}
          </div>
          <div className="calendar-grid">{calendarDays}</div>
        </div>
        <div className="right-container">
          <h4>Here is what you have coming up in the next 7 days:</h4>
          <div className="item-box">Item 1</div>
          <div className="item-box">Item 2</div>
          <div className="item-box">Item 3</div>
          <div className="item-box">Item 4</div>
          <div className="item-box">Item 5</div>
          <div className="item-box">Item 6</div>
          <div className="item-box">Item 7</div>
          <div className="item-box">Item 8</div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Items Due on {today.toLocaleString("default", { month: "long" })} {modalDay}</h3>
            <div className="modal-items">
              <div className="modal-item">Example task</div>
                <div className="modal-item">Another example</div>
              </div>

              <button className="close-button" onClick={() => {setIsModalOpen(false); setSelectedDate(null);}}>
                Close
              </button>
            </div>
          </div>
          )}
    </>
  );
}

function FormPage() {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [selectedRoommateId, setSelectedRoommateId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // 🔽 In a real app, roommates would be loaded from a GET /roommates request
  // in a useEffect, then stored with setRoommates.
  const [roommates, setRoommates] = useState([
    { id: 1, name: "Alex" },
    { id: 2, name: "Blake" },
    { id: 3, name: "Casey" },
  ]);

  const resetForm = () => {
    setType("");
    setName("");
    setDate("");
    setSelectedRoommateId("");
    setAmount("");
    setNotes("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ➤ SECTION: Create a roommate (POST /roommates)
    if (type === "roommate") {
      const nm = name && name.trim();
      if (!nm) {
        alert("Please enter a roommate name");
        return;
      }

      const id = Date.now();
      const payload = { id, name: nm };

      try {
        // 🔽 POST request to create a new roommate
        const res = await fetch("http://your-api-url.com/roommates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to add roommate");

        // In a real app you’d typically use the response JSON (with server id)
        // const saved = await res.json();
        // setRoommates((prev) => [...prev, saved]);

        setRoommates((prev) => [...prev, payload]);
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Could not add roommate");
      }
      return;
    }

    // Common checks for chores/bills
    if (!type) {
      alert("Please select Chore or Bill");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a name/title");
      return;
    }

    const roommateIdNum = selectedRoommateId
      ? Number(selectedRoommateId)
      : null;

    // ➤ SECTION: Create a chore (POST /chores)
    // CHORE payload: { id, title, assignedTo, completed, dueDate, notes }
    if (type === "chore") {
      if (!roommateIdNum) {
        alert("Please select an assignee");
        return;
      }
      if (!date) {
        alert("Please select a due date");
        return;
      }

      const payload = {
        id: Date.now(), // in a real app, backend would usually generate this
        title: name,
        assignedTo: roommateIdNum,
        completed: false,
        dueDate: date,
        notes: notes || "",
      };

      try {
        // 🔽 POST request to create a new chore
        const res = await fetch("http://your-api-url.com/chores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create chore");

        console.log("Chore submitted:", payload);

        // In a real app you’d likely read the server response:
        // const saved = await res.json();
        // and then update some shared chores state
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Error submitting chore");
      }
      return;
    }

    // ➤ SECTION: Create a bill (POST /bills)
    // BILL payload: { id, title, amount, payerId, notes }
    if (type === "bill") {
      const amtNum = parseFloat(amount);
      if (Number.isNaN(amtNum) || amtNum <= 0) {
        alert("Enter a valid bill amount");
        return;
      }
      if (!roommateIdNum) {
        alert("Please select a payer");
        return;
      }

      const payload = {
        id: Date.now(), // again, usually backend-generated in real app
        title: name,
        amount: amtNum,
        payerId: roommateIdNum,
        notes: notes || "",
      };

      try {
        // 🔽 POST request to create a new bill
        const res = await fetch("http://your-api-url.com/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create bill");

        console.log("Bill submitted:", payload);

        // Same idea: usually you’d use response JSON to update local state
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Error submitting bill");
      }
      return;
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div className="form-container">
        <h1 style={{ textAlign: "center", textDecoration: "underline" }}>
          Input A Bill or Chore:
        </h1>

        <form onSubmit={handleSubmit}>
          <label>
            Chore or Bill:
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            >
              <option value="" disabled>
                Add a Bill, Chore, or Roommate
              </option>
              <option value="chore">Chore</option>
              <option value="bill">Bill</option>
              <option value="roommate">Roommate</option>
            </select>
          </label>

          {type === "chore" && (
            <>
              <label>
                Chore:
                <input
                  type="text"
                  value={name}
                  placeholder="Name of chore"
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Assignee:
                <select
                  value={selectedRoommateId}
                  onChange={(e) => setSelectedRoommateId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="" disabled>
                    Select assignee
                  </option>
                  {/* 🔽 Uses roommates that would eventually come from GET /roommates */}
                  {roommates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due Date:
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </label>
            </>
          )}

          {type === "bill" && (
            <>
              <label>
                Bill:
                <input
                  type="text"
                  value={name}
                  placeholder="Name of bill"
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Amount:
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label>
                Payer:
                <select
                  value={selectedRoommateId}
                  onChange={(e) => setSelectedRoommateId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="" disabled>
                    Select payer
                  </option>
                  {/* 🔽 Same roommates list from (future) GET /roommates */}
                  {roommates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {type === "roommate" && (
            <label>
              Roommate name:
              <input
                type="text"
                value={name}
                placeholder="Roommate name"
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          )}

          <label>
            Notes:
            <textarea
              value={notes}
              placeholder="Anything you want to add"
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
          </label>

          <button type="submit">Submit</button>
        </form>

        <Link to="/">
          <button className="nav-button">Back to Calendar</button>
        </Link>
        <Link to="/tracker">
          <button className="nav-button">Back to Tracker</button>
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
      <Route path="/tracker" element={<FunctionTracker />} />
    </Routes>
  );
}

export default App;
