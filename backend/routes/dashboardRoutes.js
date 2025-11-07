import express from "express";
import { getUpcoming } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/upcoming", getUpcoming); // GET /api/dashboard/upcoming

export default router;
