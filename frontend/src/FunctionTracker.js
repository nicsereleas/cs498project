import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FunctionTracker.css";

export default function FunctionTracker() {
  /**
   * 🧠 DATA SOURCE OVERVIEW
   *
   * All data in this component should come from the backend, which is
   * populated by the Input Form (FormPage).
   *
   * In a "real" app you'd:
   *   - POST new roommates/chores/bills from the form page
   *   - GET roommates/chores/bills here in FunctionTracker to display them
   *
   * Example (in real code, not shown here):
   *   useEffect(() => {
   *     fetch("/api/roommates").then(...setRoommates)
   *     fetch("/api/chores").then(...setChores)
   *     fetch("/api/bills").then(...setBills)
   *   }, []);
   */

  // ✅ In a real app, this array should come from a GET /roommates
  //    (roommates are CREATED by POST /roommates from the input form)
  const [roommates, setRoommates] = useState([
    { id: 1, name: "Alex" },
    { id: 2, name: "Blake" },
    { id: 3, name: "Casey" },
  ]);

  // ✅ In a real app, this array should come from a GET /chores
  //    (chores are CREATED by POST /chores from the input form)
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

  // ✅ In a real app, this array should come from a GET /bills
  //    (bills are CREATED by POST /bills from the input form)
  // Bills have: { id, title, amount, payerId }
  const [bills, setBills] = useState([
    {
      id: 201,
      title: "Electric",
      amount: 90.0,
      payerId: 1,
    },
    {
      id: 202,
      title: "Internet",
      amount: 60.0,
      payerId: 2,
    },
  ]);

  // These derived arrays are computed locally from the fetched chores.
  const incomplete = chores.filter((c) => !c.completed);
  const completed = chores.filter((c) => c.completed);

  /**
   * ✅ UPDATE REQUEST (no creation here)
   *
   * This is the only "input" on the tracker page: marking a chore as complete.
   * In a real app, this should fire an UPDATE/PATCH request:
   *
   *   PATCH /chores/:id  { completed: true }
   *
   * and then update local state with the new chore data.
   *
   * The chore itself is still originally CREATED from the input form via POST /chores.
   */
  const markChoreComplete = (id) => {
    // Local state update; in real code this should be synced with backend response
    setChores((list) =>
      list.map((c) => (c.id === id ? { ...c, completed: true } : c))
    );
  };

  /**
   * ✅ SUMMARY CALCULATIONS
   *
   * Everything below is PURELY reading from:
   *   - roommates (GET /roommates)
   *   - bills (GET /bills)
   *
   * and computing per-roommate totals on the client.
   */
  // compute per-roommate bill owed (equal split among all roommates)
  const roommateIds = roommates.map((r) => r.id);
  const billOwed = roommates.reduce((acc, r) => ({ ...acc, [r.id]: 0 }), {});

  bills.forEach((bill) => {
    if (roommateIds.length === 0) return;
    const per = Math.round((bill.amount / roommateIds.length) * 100) / 100;

    roommateIds.forEach((rid) => {
      if (rid === bill.payerId) return; // payer doesn't owe themself
      billOwed[rid] = Math.round((billOwed[rid] + per) * 100) / 100;
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
          {/* 🔗 Navigation only — all creation happens on the Input Form page */}
          <Link to="/form">
            <button className="nav-button">Back to Input Form</button>
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
              {/* ⬇️ Uses chores that were fetched via GET /chores */}
              {incomplete.length === 0 && <div>No incomplete chores</div>}
              {incomplete.map((c) => (
                <div className="chore-item" key={c.id}>
                  <div>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Assigned to:{" "}
                      {/* ⬇️ Uses roommates that came from GET /roommates */}
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
                    {/* 🔽 This is the only mutating action here (PATCH /chores/:id in real app) */}
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
              {/* ⬇️ Also relies on chores list from GET /chores */}
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
            {/* ⬇️ Uses bills from GET /bills and roommates from GET /roommates */}
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
                  {roommates.length > 0
                    ? (
                        Math.round((b.amount / roommates.length) * 100) / 100
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="list-box">
            <h3>Roommate Summary</h3>
            {/* ⬇️ Summary depends on data from GET /roommates, GET /chores, GET /bills */}
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
        Tip: This page only reads data created from the input form; bills are
        split equally by default.
      </p>
    </div>
  );
}
