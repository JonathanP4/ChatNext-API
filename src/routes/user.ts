import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as userControllers from "../controllers/user";

const router = Router();

router.patch("/update", isAuth, userControllers.updateProfile);
router.get("/:userId", isAuth, userControllers.getUserInfo);

export default router;
