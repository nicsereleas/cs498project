// controllers/dashboardController.js
import Chore from "../models/Chore.js";
import Bill from "../models/Bill.js";

/**
 * GET /api/dashboard/upcoming
 * Query: ?days=7
 * Returns: { chores: [...], bills: [...] } with items occurring in next N days (including today)
 */
export const getUpcoming = async (req, res) => {
  try {
    const days = Math.max(1, Number(req.query.days) || 7);
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + days);

    // Find chores with dueDate within [now, end]
    const chores = await Chore.find({
      dueDate: { $gte: now, $lte: end },
    })
      .populate("assignedTo", "name email")
      .lean();

    // Find bills with dueDate within [now, end]
    const bills = await Bill.find({
      dueDate: { $gte: now, $lte: end },
    })
      .populate("payerId", "name email")
      .lean();

    // map to simple shapes
    const mappedChores = chores.map((c) => ({
      id: c._id,
      name: c.name,
      assignedTo: Array.isArray(c.assignedTo) && c.assignedTo.length > 0
        ? { id: c.assignedTo[0]._id, name: c.assignedTo[0].name }
        : c.assignedTo
        ? { id: c.assignedTo._id || c.assignedTo, name: c.assignedTo.name }
        : null,
      dueDate: c.dueDate,
      completed: !!c.completed,
    }));

    const mappedBills = bills.map((b) => ({
      id: b._id,
      description: b.description,
      amount: b.amount,
      dueDate: b.dueDate,
      payer: b.payerId ? { id: b.payerId._id || b.payerId, name: b.payerId.name } : null,
    }));

    res.json({ chores: mappedChores, bills: mappedBills });
  } catch (error) {
    console.error("getUpcoming error:", error);
    res.status(500).json({ message: error.message });
  }
};
