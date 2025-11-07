import mongoose from "mongoose";

const choreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Roommate" }], //who is responsible
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

const Chore = mongoose.model("Chore", choreSchema);
export default Chore;
