import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; //this is the Mongo connection helper

import billRoutes from "./routes/billRoutes.js";
import roommateRoutes from "./routes/roommateRoutes.js";
import choreRoutes from "./routes/choreRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import path from "path";
import { fileURLToPath } from "url";


//connects to MongoDB and this handles all mongoose logic
//helps Node resolve correct folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//explicitly tell dotenv to use backend/.env
dotenv.config({ path: path.join(__dirname, ".env") });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

//routes
app.use("/api/roommates", roommateRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/chores", choreRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Roommate API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
