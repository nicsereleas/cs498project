import Roommate from "../models/Roommate.js";

export const addRoommate = async (req, res) => {
  try {
    const roommate = await Roommate.create(req.body);
    res.status(201).json(roommate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoommates = async (req, res) => {
  try {
    const roommates = await Roommate.find();
    res.json(roommates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
