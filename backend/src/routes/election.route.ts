import { Router } from "express";
import { createElection, getElections, getElectionById, updateElection, deleteElection } from "../controllers/election.controller.js";
const router = Router();

router.route("/elections")
  .post(createElection)
  .get(getElections);

router.route("/elections/:id")
  .get(getElectionById)
  .patch(updateElection)
  .delete(deleteElection);

export default router;