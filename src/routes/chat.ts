import { Router } from "express";
import * as chatControllers from "../controllers/chat";
import isAuth from "../middleware/isAuth";

const router = Router();

router.get("/profile", isAuth, chatControllers.getProfile);
router.get("/users", chatControllers.getUsers);
router.get("/messages", isAuth, chatControllers.getMessages);

router.get("/user/:userId", isAuth, chatControllers.getUser);

router.patch("/user/update", isAuth, chatControllers.updateProfile);

export default router;
