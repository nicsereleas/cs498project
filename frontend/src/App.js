import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import "./Calendar.css";
import "./Form.css";
import FunctionTracker from "./FunctionTracker";
import "./FunctionTracker.css";

const API_BASE = "http://localhost:5000/api"; // <- use this

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

  // Data loaded from backend
  const [chores, setChores] = useState([]);
  const [bills, setBills] = useState([]);
  const [roommates, setRoommates] = useState([]);

  useEffect(() => {
    // load chores, bills, roommates for calendar and upcoming list
    fetch(`${API_BASE}/chores`)
      .then((r) => r.json())
      .then((data) => {
        // normalize chores to the shape used by the app
        const mapped = (data || []).map((c) => ({
          id: c._id || c.id,
          title: c.title || c.name || "",
          assignedTo:
            // assignedTo might be array of roommate objects or an id
            Array.isArray(c.assignedTo) && c.assignedTo.length > 0
              ? (c.assignedTo[0]._id || c.assignedTo[0].id)
              : c.assignedTo?._id || c.assignedTo || null,
          completed: !!c.completed,
          dueDate: c.dueDate ? c.dueDate : c.due_date || c.due,
          notes: c.notes || "",
        }));
        setChores(mapped);
      })
      .catch(console.error);

    fetch(`${API_BASE}/bills`)
      .then((r) => r.json())
      .then((data) => {
        const mapped = (data || []).map((b) => ({
          id: b._id || b.id,
          title: b.title || b.description || "",
          amount: typeof b.amount === "number" ? b.amount : parseFloat(b.amount) || 0,
          payerId: b.payerId || b.payer || null,
          dueDate: b.dueDate || null,
          raw: b,
        }));
        setBills(mapped);
      })
      .catch(console.error);

    fetch(`${API_BASE}/roommates`)
      .then((r) => r.json())
      .then((data) =>
        setRoommates(
          (data || []).map((r) => ({ id: r._id || r.id, name: r.name }))
        )
      )
      .catch(console.error);
  }, []);

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

  // helper: returns items (chores + bills) due on a given day (month is current)
  const itemsOnDay = (day) => {
    const monthIndex = month; // current month
    const yearNum = year;
    const match = (dStr) => {
      if (!dStr) return false;
      const dt = new Date(dStr);
      return (
        dt.getFullYear() === yearNum &&
        dt.getMonth() === monthIndex &&
        dt.getDate() === day
      );
    };

    const choresOn = chores.filter((c) => match(c.dueDate));
    const billsOn = bills.filter((b) => match(b.dueDate));
    return { choresOn, billsOn };
  };

  // compute upcoming next 7 days (starting today)
  const upcomingItems = (() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date();
      dt.setDate(dt.getDate() + i);
      const dateKey = dt.toDateString();
      const choresForDay = chores.filter((c) => {
        if (!c.dueDate) return false;
        const cd = new Date(c.dueDate);
        return cd.toDateString() === dateKey;
      });
      const billsForDay = bills.filter((b) => {
        if (!b.dueDate) return false;
        const bd = new Date(b.dueDate);
        return bd.toDateString() === dateKey;
      });
      choresForDay.forEach((c) =>
        list.push({ type: "chore", date: dateKey, title: c.title })
      );
      billsForDay.forEach((b) =>
        list.push({ type: "bill", date: dateKey, title: b.title })
      );
    }
    return list.slice(0, 8); // keep up to 8 items as your UI has 8 slots
  })();

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
          {upcomingItems.length === 0 && <div className="item-box">Nothing upcoming</div>}
          {upcomingItems.map((it, idx) => (
            <div key={idx} className="item-box">
              <strong>{it.title}</strong>
              <div style={{ fontSize: 12, color: "#666" }}>{it.type}</div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              Items Due on{" "}
              {today.toLocaleString("default", { month: "long" })} {modalDay}
            </h3>
            <div className="modal-items">
              {(() => {
                const { choresOn, billsOn } = itemsOnDay(modalDay);
                if (choresOn.length === 0 && billsOn.length === 0) {
                  return <div className="modal-item">No items due</div>;
                }
                return (
                  <>
                    {choresOn.map((c) => (
                      <div key={`c-${c.id}`} className="modal-item">
                        Chore: {c.title}{" "}
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Assigned to:{" "}
                          {roommates.find((r) => r.id === c.assignedTo)?.name ||
                            "—"}
                        </div>
                      </div>
                    ))}
                    {billsOn.map((b) => (
                      <div key={`b-${b.id}`} className="modal-item">
                        Bill: {b.title} — ${Number(b.amount).toFixed(2)}
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>

            <button
              className="close-button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedDate(null);
              }}
            >
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

  const [roommates, setRoommates] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/roommates`)
      .then((r) => r.json())
      .then((data) =>
        setRoommates((data || []).map((r) => ({ id: r._id || r.id, name: r.name })))
      )
      .catch(console.error);
  }, []);

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

    // Create roommate
    if (type === "roommate") {
      const nm = name && name.trim();
      if (!nm) {
        alert("Please enter a roommate name");
        return;
      }

      const payload = { name: nm };

      try {
        const res = await fetch(`${API_BASE}/roommates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to add roommate");
        const saved = await res.json();
        setRoommates((prev) => [...prev, { id: saved._id || saved.id, name: saved.name }]);
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Could not add roommate");
      }
      return;
    }

    // Common checks
    if (!type) {
      alert("Please select Chore or Bill");
      return;
    }
    if (!name.trim()) {
      alert("Please enter a name/title");
      return;
    }

    const roommateIdNum = selectedRoommateId ? selectedRoommateId : null;

    // Create chore
    if (type === "chore") {
      if (!roommateIdNum) {
        alert("Please select an assignee");
        return;
      }
      if (!date) {
        alert("Please select a due date");
        return;
      }

      // Backend expects: { name, assignedTo, dueDate }
      const payload = {
        name,
        assignedTo: roommateIdNum,
        dueDate: date,
        notes: notes || "",
      };

      try {
        const res = await fetch(`${API_BASE}/chores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create chore");
        // optionally read saved
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Error submitting chore");
      }
      return;
    }

    // Create bill
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
      if (!date) {
        alert("Please select a due date for the bill");
        return;
      }

      // Backend addBill expects: { description, amount, dueDate }
      // We also send payerId so frontend can display who paid; backend can ignore or store if it supports it.
      const payload = {
        description: name,
        amount: amtNum,
        dueDate: date,
        payerId: roommateIdNum,
        notes: notes || "",
      };

      try {
        const res = await fetch(`${API_BASE}/bills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create bill");
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Error submitting bill");
      }
      return;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="form-container">
        <h1 style={{ textAlign: "center", textDecoration: "underline" }}>Input A Bill or Chore:</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Chore or Bill:
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}>
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
                <input type="text" value={name} placeholder="Name of chore" onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
              </label>
              <label>
                Assignee:
                <select value={selectedRoommateId} onChange={(e) => setSelectedRoommateId(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}>
                  <option value="" disabled>
                    Select assignee
                  </option>
                  {roommates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due Date:
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
              </label>
            </>
          )}

          {type === "bill" && (
            <>
              <label>
                Bill:
                <input type="text" value={name} placeholder="Name of bill" onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
              </label>
              <label>
                Amount:
                <input type="number" step="0.01" value={amount} placeholder="0.00" onChange={(e) => setAmount(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
              </label>
              <label>
                Payer:
                <select value={selectedRoommateId} onChange={(e) => setSelectedRoommateId(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}>
                  <option value="" disabled>
                    Select payer
                  </option>
                  {roommates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due Date:
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
              </label>
            </>
          )}

          {type === "roommate" && (
            <label>
              Roommate name:
              <input type="text" value={name} placeholder="Roommate name" onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
            </label>
          )}

          <label>
            Notes:
            <textarea value={notes} placeholder="Anything you want to add" onChange={(e) => setNotes(e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box" }} />
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
