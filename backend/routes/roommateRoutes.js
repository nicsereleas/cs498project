import express from "express";
import { addRoommate, getRoommates } from "../controllers/roommateController.js";

const router = express.Router();

router.post("/", addRoommate);
router.get("/", getRoommates);

export default router;
