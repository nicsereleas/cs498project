import Chore from "../models/Chore.js";

//add a new chore
export const addChore = async (req, res) => {
  try {
    const { name, assignedTo, dueDate } = req.body;
    const chore = await Chore.create({ name, assignedTo, dueDate });
    res.status(201).json(chore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//mark chore as done
export const markChoreDone = async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.id);
    if (!chore) return res.status(404).json({ message: "Chore not found" });

    chore.completed = true;
    await chore.save();

    res.json(chore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all chores
export const getChores = async (req, res) => {
  try {
    const chores = await Chore.find().populate("assignedTo", "name email");
    res.json(chores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
