import { Router } from "express";
import { loginVoter, logoutVoter, registerVoter } from "../controllers/voter.controller.js";

const router = Router();

router.route('/register').post(registerVoter);
router.route('/login').post(loginVoter);
router.route('/logout').post(logoutVoter);
 
export default router;