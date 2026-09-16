import { Router } from "express";
import { sendVote, getVotes } from "../controllers/vote.controller.js";

const router = Router();

router.route('/').post(sendVote);
router.route('/results').get(getVotes);
 
export default router;