import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FunctionTracker.css";

const API_BASE = "http://localhost:5000/api";

export default function FunctionTracker() {
  const [roommates, setRoommates] = useState([]);
  const [chores, setChores] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load backend data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/roommates`).then((r) => r.json()),
      fetch(`${API_BASE}/chores`).then((r) => r.json()),
      fetch(`${API_BASE}/bills`).then((r) => r.json()),
    ])
      .then(([rmData, choreData, billData]) => {
        setRoommates((rmData || []).map((r) => ({ id: r._id || r.id, name: r.name })));

        // Normalize chores coming from server into the shape this component expects
        const normalizedChores = (choreData || []).map((c) => ({
          id: c._id || c.id,
          title: c.title || c.name || "",
          // assignedTo might be an array of populated roommates or an id
          assignedTo:
            Array.isArray(c.assignedTo) && c.assignedTo.length > 0
              ? (c.assignedTo[0]._id || c.assignedTo[0].id)
              : c.assignedTo?._id || c.assignedTo || null,
          completed: !!c.completed,
          dueDate: c.dueDate || null,
          notes: c.notes || "",
        }));
        setChores(normalizedChores);

        // Normalize bills
        const normalizedBills = (billData || []).map((b) => ({
          id: b._id || b.id,
          title: b.title || b.description || "",
          amount: typeof b.amount === "number" ? b.amount : parseFloat(b.amount) || 0,
          payerId: b.payerId || b.payer || null,
          splits: b.splits || null,
          dueDate: b.dueDate || null,
          raw: b,
        }));
        setBills(normalizedBills);
      })
      .catch((err) => {
        console.error("Failed to load tracker data", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const markChoreComplete = async (id) => {
    try {
      // PATCH route defined as /api/chores/:id/done
      const res = await fetch(`${API_BASE}/chores/${id}/done`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update chore");
      const updated = await res.json();

      // Update local state with returned chore if available, otherwise just set completed
      setChores((list) =>
        list.map((c) => (c.id === id ? { ...c, completed: true, ...updated } : c))
      );
    } catch (err) {
      console.error(err);
      alert("Could not update chore");
    }
  };

  const incomplete = chores.filter((c) => !c.completed);
  const completed = chores.filter((c) => c.completed);

  // compute per-roommate bill owed (equal split among all roommates)
  const roommateIds = roommates.map((r) => r.id);
  const billOwed = roommates.reduce((acc, r) => ({ ...acc, [r.id]: 0 }), {});

  bills.forEach((bill) => {
    if (roommateIds.length === 0) return;
    // If bill has splits array created by backend, try to use those owedAmounts
    if (Array.isArray(bill.splits) && bill.splits.length > 0) {
      bill.splits.forEach((s) => {
        const rid = s.roommate?._id || s.roommate?.id || s.roommate;
        if (!rid) return;
        accSafeAdd(billOwed, rid, s.owedAmount || 0);
      });
    } else {
      // fallback: equal split, ignore payerId (payer doesn't owe themself)
      const per = Math.round((bill.amount / roommateIds.length) * 100) / 100;
      roommateIds.forEach((rid) => {
        if (rid === bill.payerId) return;
        accSafeAdd(billOwed, rid, per);
      });
    }
  });

  function accSafeAdd(obj, key, val) {
    obj[key] = Math.round(((obj[key] || 0) + (val || 0)) * 100) / 100;
  }

  const choresCompletedCount = (rid) => completed.filter((c) => c.assignedTo === rid).length;

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  };

  const todayString = new Date().toLocaleDateString();

  if (loading) {
    return (
      <div className="tracker-root">
        <h2>Loading tracker...</h2>
      </div>
    );
  }

  return (
    <div className="tracker-root">
      <header className="tracker-header">
        <div>
          <h2>Function Tracker</h2>
          <div style={{ fontSize: 13, color: "#444" }}>Today: {todayString}</div>
        </div>
        <div className="tracker-controls">
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
              {incomplete.length === 0 && <div>No incomplete chores</div>}
              {incomplete.map((c) => (
                <div className="chore-item" key={c.id}>
                  <div>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Assigned to: {roommates.find((r) => r.id === c.assignedTo)?.name || "—"}
                    </div>
                    {c.dueDate && <div className="due-date">Due: {formatDate(c.dueDate)}</div>}
                  </div>
                  <div>
                    <button className="small-btn" onClick={() => markChoreComplete(c.id)}>
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
                      Completed by: {roommates.find((r) => r.id === c.assignedTo)?.name || "—"}
                    </div>
                    {c.dueDate && <div className="due-date">Due: {formatDate(c.dueDate)}</div>}
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
                    Amount: ${Number(b.amount).toFixed(2)} — Payer:{" "}
                    {roommates.find((r) => r.id === b.payerId)?.name || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>
                  Split: $
                  {roommates.length > 0
                    ? (Math.round((b.amount / roommates.length) * 100) / 100).toFixed(2)
                    : "0.00"}
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
                    <td style={{ padding: 6 }}>${((billOwed[r.id] || 0) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="tracker-note">Tip: This page only reads data created from the input form; bills are split equally by default.</p>
    </div>
  );
}
