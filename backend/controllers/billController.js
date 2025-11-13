import Bill from "../models/Bill.js";
import Roommate from "../models/Roommate.js";

export const addBill = async (req, res) => {
  try {
    const { description, amount, dueDate } = req.body;

    // Basic validation
    if (!description || !amount || !dueDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const roommates = await Roommate.find();

    // Allow bills even if no roommates exist
    let splits = [];
    if (roommates.length > 0) {
      const splitAmount = parseFloat((amount / roommates.length).toFixed(2));
      splits = roommates.map(r => ({
        roommate: r._id,
        owedAmount: splitAmount,
      }));
    }

    const bill = await Bill.create({
      description,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      splits,
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("splits.roommate", "name email");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
