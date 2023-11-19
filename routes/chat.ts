import { Router } from "express";
import * as chatControllers from "../controllers/chat.js";
import isAuth from "../middleware/isAuth.js";

const router = Router();

router.get("/users", isAuth, chatControllers.getUsers);
router.get("/user/:userId", isAuth, chatControllers.getUser);
router.get("/messages/:userId", isAuth, chatControllers.getMessages);

router.post("/send", isAuth, chatControllers.getUsers);
router.post("/message", isAuth, chatControllers.postMessage);

router.patch("/user/update/:userId", isAuth, chatControllers.updateProfile);

export default router;
