import express from "express";
import { addChore, markChoreDone, getChores } from "../controllers/choreController.js";

const router = express.Router();

router.post("/", addChore); //add new chore
router.patch("/:id/done", markChoreDone); //aark a chore as done
router.get("/", getChores); //list all chores

export default router;
