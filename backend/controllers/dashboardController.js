import Bill from "../models/Bill.js";
import Chore from "../models/Chore.js";

export const getUpcoming = async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    //bills due in the next 7 days
    const upcomingBills = await Bill.find();

    //chores due in the next 7 days
    const upcomingChores = await Chore.find({
      dueDate: { $gte: now, $lte: nextWeek }
    }).populate("assignedTo", "name email");

    res.json({
      bills: upcomingBills,
      chores: upcomingChores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
