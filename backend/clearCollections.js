// clearCollections.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Roommate from "./models/Roommate.js";
import Chore from "./models/Chore.js";
import Bill from "./models/Bill.js"; // make sure you have a Bill model

dotenv.config();
const DB_URI = process.env.MONGO_URI;

const clearCollections = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to DB");

    await Roommate.deleteMany({});
    console.log("Roommates cleared");

    await Chore.deleteMany({});
    console.log("Chores cleared");

    await Bill.deleteMany({});
    console.log("Bills cleared");

    await mongoose.disconnect();
    console.log("Done. Collections are empty.");
  } catch (err) {
    console.error(err);
  }
};

clearCollections();
