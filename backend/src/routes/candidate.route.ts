import { Router } from "express";
import { addCandidate, getCandidates } from "../controllers/candidate.controller.js";
const router = Router();

router.route('/add').post(addCandidate);
router.route('/').get(getCandidates);

export default router;