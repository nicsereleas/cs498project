// controllers/billController.js
import Bill from "../models/Bill.js";
import Roommate from "../models/Roommate.js";

// create a new bill and automatically split among roommates
export const addBill = async (req, res) => {
  try {
    const { description, amount, dueDate, payerId, notes } = req.body;

    if (!description || amount == null || !dueDate) {
      return res.status(400).json({ message: "description, amount and dueDate required" });
    }

    // find roommates to split among
    const roommates = await Roommate.find();
    if (!roommates || roommates.length === 0) {
      return res.status(400).json({ message: "No roommates found to split the bill." });
    }

    // compute split (rounded to 2 decimals)
    const splitAmount = parseFloat((amount / roommates.length).toFixed(2));

    const splits = roommates.map((r) => ({
      roommate: r._id,
      owedAmount: splitAmount,
    }));

    // create bill document, include payerId if provided
    const bill = await Bill.create({
      description,
      amount,
      dueDate,
      payerId: payerId || null,
      splits,
      notes: notes || "",
    });

    // return populated bill (populate payer and splits.roommate)
    const populated = await Bill.findById(bill._id)
      .populate("payerId", "name email")
      .populate("splits.roommate", "name email");

    res.status(201).json(populated);
  } catch (error) {
    console.error("addBill error:", error);
    res.status(500).json({ message: error.message });
  }
};

// get all bills (normalized)
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("payerId", "name email")
      .populate("splits.roommate", "name email")
      .lean();

    // normalize output to friendly shape (frontend tolerant)
    const mapped = bills.map((b) => ({
      _id: b._id,
      description: b.description,
      title: b.description, // keep compatibility with frontend expecting title
      amount: b.amount,
      dueDate: b.dueDate,
      payerId: b.payerId ? (b.payerId._id || b.payerId) : null,
      payer: b.payerId ? { id: b.payerId._id || b.payerId, name: b.payerId.name } : null,
      splits: b.splits,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("getBills error:", error);
    res.status(500).json({ message: error.message });
  }
};
