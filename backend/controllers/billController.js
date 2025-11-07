import Bill from "../models/Bill.js";
import Roommate from "../models/Roommate.js";

//create a new bill and automatically split among roommates
export const addBill = async (req, res) => {
  try {
    const { description, amount, dueDate } = req.body;

    const roommates = await Roommate.find();
    if (roommates.length === 0) {
      return res.status(400).json({ message: "No roommates found to split the bill." });
    }

    const splitAmount = parseFloat((amount / roommates.length).toFixed(2));

    const splits = roommates.map(r => ({
      roommate: r._id,
      owedAmount: splitAmount,
    }));

    const bill = await Bill.create({ description, amount, dueDate, splits });
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all bills
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("splits.roommate", "name email");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
