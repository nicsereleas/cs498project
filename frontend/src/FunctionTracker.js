import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FunctionTracker.css";

export default function FunctionTracker() {
  // New data model: roommates, chores, bills

  // Replace with real data fetching in a real app
  const [roommates, setRoommates] = useState([
    { id: 1, name: "Alex" },
    { id: 2, name: "Blake" },
    { id: 3, name: "Casey" },
  ]);

  // Replace with real data fetching in a real app
  const [chores, setChores] = useState([
    {
      id: 101,
      title: "Take out trash",
      assignedTo: 1,
      completed: false,
      dueDate: "2025-11-25",
    },
    {
      id: 102,
      title: "Dishes",
      assignedTo: 2,
      completed: true,
      dueDate: "2025-11-18",
    },
    {
      id: 103,
      title: "Vacuum",
      assignedTo: 3,
      completed: false,
      dueDate: "2025-11-27",
    },
  ]);

  // Replace with real data fetching in a real app
  const [bills, setBills] = useState([
    {
      id: 201,
      title: "Electric",
      amount: 90.0,
      payerId: 1,
      splitAmong: [1, 2, 3],
    },
    {
      id: 202,
      title: "Internet",
      amount: 60.0,
      payerId: 2,
      splitAmong: [1, 2, 3],
    },
  ]);

  const incomplete = chores.filter((c) => !c.completed);
  const completed = chores.filter((c) => c.completed);

  const markChoreComplete = (id) => {
    setChores((list) =>
      list.map((c) => (c.id === id ? { ...c, completed: true } : c))
    );
  };

  const addCompletedChore = () => {
    const title = prompt("Completed chore title:");
    if (!title) return;
    const assigneeName = prompt("Assigned to (name):");
    const dueInput = prompt("Due date (YYYY-MM-DD) - optional:");
    const assignee = roommates.find(
      (r) => r.name.toLowerCase() === (assigneeName || "").toLowerCase()
    );
    const assignedTo = assignee ? assignee.id : roommates[0]?.id || Date.now();
    setChores((c) => [
      ...c,
      {
        id: Date.now(),
        title,
        assignedTo,
        completed: true,
        dueDate: dueInput,
      },
    ]);
  };

  const addBill = () => {
    const title = prompt("Bill title:");
    const amount = parseFloat(prompt("Amount:"));
    if (!title || isNaN(amount)) return;
    const payerName = prompt("Payer name:");
    const payer =
      roommates.find(
        (r) => r.name.toLowerCase() === (payerName || "").toLowerCase()
      ) || roommates[0];
    // by default split equally among all roommates
    setBills((b) => [
      ...b,
      {
        id: Date.now(),
        title,
        amount,
        payerId: payer.id,
        splitAmong: roommates.map((r) => r.id),
      },
    ]);
  };

  // compute per-roommate bill owed (they owe their share to payer)
  const billOwed = roommates.reduce((acc, r) => ({ ...acc, [r.id]: 0 }), {});
  bills.forEach((bill) => {
    const members =
      bill.splitAmong && bill.splitAmong.length
        ? bill.splitAmong
        : roommates.map((r) => r.id);
    const per = Math.round((bill.amount / members.length) * 100) / 100;
    members.forEach((mid) => {
      if (mid === bill.payerId) return; // payer doesn't owe themself
      billOwed[mid] = Math.round((billOwed[mid] + per) * 100) / 100;
    });
  });

  const choresCompletedCount = (rid) =>
    completed.filter((c) => c.assignedTo === rid).length;

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  };

  const todayString = new Date().toLocaleDateString();

  return (
    <div className="tracker-root">
      <header className="tracker-header">
        <div>
          <h2>Function Tracker</h2>
          <div style={{ fontSize: 13, color: "#444" }}>
            Today: {todayString}
          </div>
        </div>
        <div className="tracker-controls">
          <button className="nav-button" onClick={addCompletedChore}>
            Enter Completed Chore
          </button>
          <Link to="/form">
            <button className="nav-button">Add Bill</button>
          </Link>
          <Link to="/">
            <button className="nav-button">Back to Calendar</button>
          </Link>
        </div>
      </header>

      <div className="tracker-main">
        <div>
          <div className="lists">
            <div className="list-box">
              <h3>Incomplete Chores</h3>
              {incomplete.length === 0 && <div>No incomplete chores</div>}
              {incomplete.map((c) => (
                <div className="chore-item" key={c.id}>
                  <div>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Assigned to:{" "}
                      {roommates.find((r) => r.id === c.assignedTo)?.name ||
                        "—"}
                    </div>
                    {c.dueDate && (
                      <div className="due-date">
                        Due: {formatDate(c.dueDate)}
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      className="small-btn"
                      onClick={() => markChoreComplete(c.id)}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="list-box">
              <h3>Completed Chores</h3>
              {completed.length === 0 && <div>No completed chores yet</div>}
              {completed.map((c) => (
                <div className="chore-item" key={c.id}>
                  <div>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Completed by:{" "}
                      {roommates.find((r) => r.id === c.assignedTo)?.name ||
                        "—"}
                    </div>
                    {c.dueDate && (
                      <div className="due-date">
                        Due: {formatDate(c.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }} className="list-box">
            <h3>Bills</h3>
            {bills.length === 0 && <div>No bills recorded</div>}
            {bills.map((b) => (
              <div className="chore-item" key={b.id}>
                <div>
                  <strong>{b.title}</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Amount: ${b.amount.toFixed(2)} — Payer:{" "}
                    {roommates.find((r) => r.id === b.payerId)?.name || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>
                  Split: $
                  {Math.round((b.amount / b.splitAmong.length) * 100) / 100}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="list-box">
            <h3>Roommate Summary</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Name</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Chores Done</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Bills Owed</th>
                </tr>
              </thead>
              <tbody>
                {roommates.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: 6 }}>{r.name}</td>
                    <td style={{ padding: 6 }}>{choresCompletedCount(r.id)}</td>
                    <td style={{ padding: 6 }}>
                      ${(billOwed[r.id] || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="tracker-note">
        Tip: Completed chores can be entered here; bills are split equally by
        default.
      </p>
    </div>
  );
}
