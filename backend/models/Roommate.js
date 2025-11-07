import mongoose from "mongoose";

const roommateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
});

const Roommate = mongoose.model("Roommate", roommateSchema);
export default Roommate;
