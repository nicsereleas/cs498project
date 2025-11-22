import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: "Roommate", required: true },
  splits: [
    {
      roommate: { type: mongoose.Schema.Types.ObjectId, ref: "Roommate" },
      owedAmount: Number,
      paid: { type: Boolean, default: false },
    },
  ],
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;